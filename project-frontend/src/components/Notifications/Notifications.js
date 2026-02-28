import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import "../../styles/Notifications/Notifications.css";
import { useEmployee } from "../../context/EmployeeContext";
import { useToast } from "../../context/ToastContext";
import axiosInstance from "../axiosConfig";


const Notifications = () => {
    const { employee } = useEmployee(); // current user (AGM or PM etc.)
    const isAGM = employee?.role === "Assistant General Manager";
    const userId = employee?.empId;

    const [clearedIds, setClearedIds] = useState(() => {
        // optionally persist in localStorage to survive refresh
        const saved = localStorage.getItem("clearedNotifications");
        return saved ? JSON.parse(saved) : [];
    });


    const LIMIT = 5; // number of notifications per page

    const [visibleNotifications, setVisibleNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { showToast } = useToast();

    // Clear all read notifications
    const handleClearAll = () => {
        const readIds = notifications.filter((n) => n.readStatus).map((n) => n.id);
        const updatedCleared = Array.from(new Set([...clearedIds, ...readIds]));
        setClearedIds(updatedCleared);
        localStorage.setItem("clearedNotifications", JSON.stringify(updatedCleared));

        // Update visible notifications
        const filtered = notifications.filter((n) => !n.readStatus || !updatedCleared.includes(n.id));
        setVisibleNotifications(filtered.slice(0, page * LIMIT));
        setHasMore(filtered.length > page * LIMIT);
    };


    const formatDateTime = (dateString) => {
        const d = new Date(dateString);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
    };

    const displayedNotifications = notifications.filter(
        (n) => !n.readStatus || !clearedIds.includes(n.id)
    );

    // --- parsing helpers based on your confirmed schema ---
    const extractProjectId = (msg) =>
        parseInt(msg.match(/projectId=(\d+)/)?.[1]);

    const extractRequestedHours = (msg) =>
        parseInt(msg.match(/Requesting\s+(\d+)\s+extra hours/)?.[1]);

    const extractRequestedDate = (msg) =>
        msg.match(/completion date to\s+(\d{4}-\d{2}-\d{2})/)?.[1];

    const extractProjectName = (msg) =>
        msg.match(/Project:\s*([^|]+)/)?.[1]?.trim();

    // fetch notifications from backend
    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const res = await axiosInstance.get(`/notifications/${userId}`);
            const sorted = (res.data || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setNotifications(sorted);
           

            // initialize visible notifications for page 1
            // Filter out cleared notifications
            const filtered = sorted.filter((n) => !clearedIds.includes(n.id));
             
            // initialize visible notifications for page 1
            setVisibleNotifications(filtered.slice(0, LIMIT));
            setHasMore(filtered.length > LIMIT);

            setPage(1);
        } catch (err) {
            
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        const start = page * LIMIT;
        const end = start + LIMIT;
        const filteredNotifications = notifications.filter((n) => !clearedIds.includes(n.id));
        const nextNotifications = filteredNotifications.slice(start, end);

        setVisibleNotifications((prev) => [...prev, ...nextNotifications]);
        setPage(nextPage);
        setHasMore(end < notifications.length);
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const unreadCount = notifications.filter((n) => !n.readStatus).length;

    // Open details modal. For AGM REQUEST, do NOT auto-mark read.
    const openDetails = async (n) => {
        // Only skip auto-marking read when the current user is AGM AND the notification is an actionable request.
        // Correct parentheses ensure proper operator precedence.
        const isActionableRequest = isAGM && (n.type === "COMPLETION_EXTENSION" || n.type === "EXTRA_HOURS");

        if (!isActionableRequest) {
            if (!n.readStatus) {
                try {
                    await axiosInstance.put(`/notifications/read/${n.id}`);
                    // optimistic update for the list
                    setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, readStatus: true } : item))
                    );
                } catch (err) {
                    
                }
            }
        }

        // always set selectedNotification to the clicked item (use latest state copy from list if present)
        // prefer the version from notifications[] (so we reflect optimistic updates)
        const latest = notifications.find((it) => it.id === n.id) || n;
        setSelectedNotification(latest);
        await fetchNotifications();
    };


    const closeDetails = () => setSelectedNotification(null);

    // Send a reply notification (AGM -> PM or vice versa)
    const sendReplyNotification = async ({ senderId, receiverId, title, message, type }) => {
        try {
            const url =
                `/notifications/create` +
                `?senderId=${senderId}` +
                `&receiverId=${receiverId}` +
                `&title=${encodeURIComponent(title)}` +
                `&message=${encodeURIComponent(message)}` +
                `&type=${encodeURIComponent(type)}`;
            await axiosInstance.post(url);
        } catch (err) {
            
            throw err;
        }
    };

    // Approve handler (AGM approves request)
    const handleApprove = async () => {
        if (!selectedNotification) return;
        setActionLoading(true);

        const msg = selectedNotification.message || "";
        const notificationId = selectedNotification.id;
        const projectId = extractProjectId(msg);
        const projectName = extractProjectName(msg) || "Project";
        const senderOfRequest = selectedNotification.senderId; // expected to exist

        if (!projectId) {
            showToast("Cannot find projectId in notification message. Approval aborted.","error");
            setActionLoading(false);
            return;
        }

        try {
            // 1) Perform project update depending on type
            if (selectedNotification.type === "EXTRA_HOURS") {
                const hours = extractRequestedHours(msg);
                if (!hours || hours <= 0) {
                    showToast("Invalid requested hours in notification message.","info");
                    setActionLoading(false);
                    return;
                }

                // Call your existing extra-hours endpoint (you used this earlier)
                await axiosInstance.put(
                    `/project/set-extra-hours/${projectId}?extraHours=${hours}`
                );
            } else if (selectedNotification.type === "COMPLETION_EXTENSION") {
                const projectId = extractProjectId(selectedNotification.message);
                const requestedDate = extractRequestedDate(selectedNotification.message);

                if (!requestedDate) {
                    showToast("Invalid requested completion date in the notification.","info");
                    setActionLoading(false);
                    return;
                }

                await axiosInstance.put(
                    `/project/extend/${projectId}?completedDate=${requestedDate}`
                );

                showToast("Project completion date updated successfully ✅","success");
            }

            // 2) Mark notification as approved on server
            // Your controller has PUT /notifications/approve/{id}
            await axiosInstance.put(`/notifications/approve/${notificationId}`);

            // 3) Send a reply notification back to requester (PM) that it's approved
            if (!senderOfRequest) {
                // if senderId not returned from backend, inform to add it in response
                
                showToast("Approved locally, but couldn't send reply to requester because senderId is missing on notification. Please include senderId in notification GET response.","info");
            } else {
                const replyTitle = `${selectedNotification.type === "EXTRA_HOURS" ? "Extra Hours Approved" : "Extension Approved"}`;
                const replyMessage = `Project: ${projectName} | projectId=${projectId} | Your request has been APPROVED by ${employee.name || "AGM"}.`;
                await sendReplyNotification({
                    senderId: employee.empId,
                    receiverId: senderOfRequest,
                    title: replyTitle,
                    message: replyMessage,
                    type: "INFO",
                });
            }

            // 4) optimistic UI updates: mark original notification as read + approved status
            // optimistic UI update for list + modal (mark approved & read)
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notificationId ? { ...item, readStatus: true, status: "APPROVED", approved: true } : item
                )
            );

            // also update the modal state if it's open
            setSelectedNotification((prev) =>
                prev && prev.id === notificationId ? { ...prev, readStatus: true, status: "APPROVED", approved: true } : prev
            );

            // reload fresh data from server
            await fetchNotifications();
            showToast("Request approved and project updated ✅","success");

        } catch (err) {
            
            showToast("Failed to complete approval. Check console for details.","error");
        } finally {
            setActionLoading(false);
            closeDetails();
        }
    };

    // Reject handler (AGM rejects request)
    const handleReject = async () => {
        if (!selectedNotification) return;
        setActionLoading(true);

        const msg = selectedNotification.message || "";
        const notificationId = selectedNotification.id;
        const projectId = extractProjectId(msg);
        const projectName = extractProjectName(msg) || "Project";
        const senderOfRequest = selectedNotification.senderId;

        try {
            // Mark original notification as read (no specific "reject" endpoint available)
            await axiosInstance.put(`/notifications/read/${notificationId}`);

            // Send a reply notification back to requester (PM) that it's rejected
            if (!senderOfRequest) {
                
                showToast("Rejected locally, but couldn't send reply to requester because senderId is missing on notification. Please include senderId in notification GET response.","info");
            } else {
                const replyTitle = `${selectedNotification.type === "EXTRA_HOURS" ? "Extra Hours Rejected" : "Extension Rejected"}`;
                const replyMessage = `Project: ${projectName} | projectId=${projectId} | Your request has been REJECTED by ${employee.name || "AGM"}. Reason: ${selectedNotification.type === "EXTRA_HOURS" ? "Extra hours not approved" : "Extension not approved"}`;
                await sendReplyNotification({
                    senderId: employee.empId,
                    receiverId: senderOfRequest,
                    title: replyTitle,
                    message: replyMessage,
                    type: "INFO",
                });
            }

            // optimistic UI updates
            // optimistic UI update for list + modal (mark rejected & read)
            setNotifications((prev) =>
                prev.map((item) =>
                    item.id === notificationId ? { ...item, readStatus: true, status: "REJECTED", approved: false } : item
                )
            );

            setSelectedNotification((prev) =>
                prev && prev.id === notificationId ? { ...prev, readStatus: true, status: "REJECTED", approved: false } : prev
            );


            await fetchNotifications();
            showToast("Request rejected and requester notified ❌","info");
        } catch (err) {
            
            showToast("Failed to complete rejection. Check console for details.","error");
        } finally {
            setActionLoading(false);
            closeDetails();
        }
    };
    

    return (
        <>
            {/* Bell Icon */}
            <div className="notification-icon" onClick={() => setOpenModal(true)}>
                <FaBell size={22} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>

            {/* Notifications List Modal */}
            {openModal && (
                <div className="overlay" onClick={() => setOpenModal(false)}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-top-btn" onClick={() => setOpenModal(false)}>
                            &times;
                        </button>

                        <h3>Notifications</h3>
                        {visibleNotifications.length && <button className="clear-btn" onClick={handleClearAll} style={{ marginBottom: 10 }}>
                            Clear All Read
                        </button>}

                        <ul className="notification-list">
                            {visibleNotifications.length === 0 && <p style={{ color: "#555",backgroundColor: "#f3f4f6", padding: "15px 20px",borderRadius: "8px",textAlign: "center",fontSize: "16px",fontWeight: "500",boxShadow: "0 2px 6px rgba(0,0,0,0.1)",margin: "10px auto",width: "fit-content", }}>No Notifications</p>}
                            {visibleNotifications.map((n) => (
                                <li
                                    key={n.id}
                                    className={`notification-item ${!n.readStatus ? "unread" : ""} ${n.status ? n.status.toLowerCase() : ""}`}
                                    onClick={() => openDetails(n)}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <strong>{n.title}</strong>
                                        <small>{formatDateTime(n.createdAt)}</small>
                                    </div>

                                    {/* show inline status label if exists */}
                                    {/* {n.readStatus &&  n.approved && <div style={{ color: "green", marginTop: 6 }}>Approved ✅</div>}
                                    {n.readStatus && !n.approved && <div style={{ color: "red", marginTop: 6 }}>Rejected ❌</div>} */}
                                </li>
                            ))}
                        </ul>
                        {hasMore && (
                            <button className="load-more-btn" onClick={loadMore} style={{ marginTop: 10 }}>
                                Load More
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Details Modal */}
            {selectedNotification && (
                <div className="overlay" onClick={closeDetails}>
                    <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedNotification.title}</h3>
                        <p>{selectedNotification.message}</p>
                        <small>{formatDateTime(selectedNotification.createdAt)}</small>

                        {/* Show Approved/Rejected label if present */}
                        {isAGM && selectedNotification.readStatus && selectedNotification.approved && <div style={{ color: "green", marginTop: 8 }}>Approved ✅</div>}
                        {isAGM && selectedNotification.readStatus && !selectedNotification.approved && <div style={{ color: "red", marginTop: 8 }}>Rejected ❌</div>}

                        {/* Approve / Reject buttons only for AGM and specific request types */}
                        {isAGM &&
                            (selectedNotification.type === "EXTRA_HOURS" ||
                                selectedNotification.type === "COMPLETION_EXTENSION") &&
                            !selectedNotification.readStatus &&   // <-- only unread
                            !selectedNotification.status && (      // <-- status not set
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                                    <button className="approve-btn" disabled={actionLoading} onClick={handleApprove}>
                                        {actionLoading ? "Processing..." : "Approve"}
                                    </button>
                                    <button className="reject-btn" disabled={actionLoading} onClick={handleReject}>
                                        {actionLoading ? "Processing..." : "Reject"}
                                    </button>
                                </div>
                            )}


                        <button className="close-btn" onClick={closeDetails} style={{ marginTop: 12 }}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Notifications;
