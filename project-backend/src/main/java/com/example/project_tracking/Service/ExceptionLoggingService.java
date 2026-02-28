package com.example.project_tracking.Service;

import com.example.project_tracking.Model.ExceptionLog;
import com.example.project_tracking.Repository.ExceptionLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExceptionLoggingService {

    private final ExceptionLogRepository exceptionLogRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logException(Exception exception, HttpServletRequest request) {
        try {
            ExceptionLog exceptionLog = new ExceptionLog();
            exceptionLog.setExceptionType(exception.getClass().getName());
            exceptionLog.setMessage(exception.getMessage());
            exceptionLog.setStackTrace(getStackTraceAsString(exception));

            if (request != null) {
                exceptionLog.setEndpoint(request.getRequestURI());
                exceptionLog.setHttpMethod(request.getMethod());
                exceptionLog.setRequestParams(getRequestParams(request));
            }

            exceptionLogRepository.save(exceptionLog);
            log.info("Exception logged to database: {}", exception.getClass().getName());
        } catch (Exception e) {
            log.error("Failed to log exception to database", e);
        }
    }

    private String getStackTraceAsString(Exception exception) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        exception.printStackTrace(pw);
        return sw.toString();
    }

    private String getRequestParams(HttpServletRequest request) {
        StringBuilder params = new StringBuilder();
        request.getParameterMap().forEach((key, values) -> {
            params.append(key).append("=").append(Arrays.toString(values)).append("; ");
        });
        return params.toString();
    }
}
