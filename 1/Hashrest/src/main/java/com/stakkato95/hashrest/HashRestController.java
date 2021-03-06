package com.stakkato95.hashrest;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.Produces;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@ExecuteOn(TaskExecutors.IO)
@Controller
public class HashRestController {

    private static MessageDigest MD;

    static {
        try {
            MD = MessageDigest.getInstance("SHA-256");
        } catch (Exception e) {
            //ignore
        }
    }

    private List<String> hashes;

    @Get("/greet")
//    @Produces(value = MediaType.APPLICATION_JSON)
    HttpResponse<String> greet(@Header("HashREST") String hashRest) {
        var isValid = validate(hashRest, 1);

        if (isValid) {
            return HttpResponse.ok("valid cashhash");
        }
        return HttpResponse.badRequest("invalid cashhash");
    }

    @Get("/upload")
    HttpResponse<String> upload(@Header("HashREST") String hashRest) {
        var isValid = validate(hashRest, 3);

        if (isValid) {
            return HttpResponse.ok("valid cashhash");
        }
        return HttpResponse.badRequest("invalid cashhash");
    }

    @Get("/list")
    HttpResponse<List<String>> list() {
        return HttpResponse.ok(hashes);
    }

    private static boolean validate(String hashRest, int difficulty) {
        var bytes = MD.digest(hashRest.getBytes(StandardCharsets.UTF_8));

        for (var i = 0; i < difficulty; i++) {
            if (bytes[i] != 0) {
                return false;
            }
        }

        return true;
    }
}
