package com.stakkato95.hashrest;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.client.HttpClient;
import io.micronaut.http.client.annotation.Client;
import io.micronaut.http.uri.UriBuilder;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Random;

@ExecuteOn(TaskExecutors.IO)
@Controller("/client")
public class HasRestClientController {

    private static final String HASH_REST_TEMPLATE = "%s;%s;%s;%s";
    private static final String URL = "whatever.com";
    private static MessageDigest MD;

    private final HttpClient httpClient;
    private final URI uriGreet;
    private final URI uriUpload;

    public HasRestClientController(@Client("http://localhost:8080") HttpClient httpClient) {
        this.httpClient = httpClient;
        this.uriGreet = UriBuilder.of("/greet").build();
        this.uriUpload = UriBuilder.of("/upload").build();
    }

    static {
        try {
            MD = MessageDigest.getInstance("SHA-256");
        } catch (Exception e) {
            //ignore
        }
    }

    @Get("/greet")
    Mono<String> greet() {
        var req = HttpRequest.GET(uriGreet)
                .header("HashREST", prepare(1));
        return Mono.from(httpClient.retrieve(req));
    }

    @Get("/upload")
    Mono<String> upload() {
        var req = HttpRequest.GET(uriUpload)
                .header("HashREST", prepare(3));
        return Mono.from(httpClient.retrieve(req));
    }

    private static String prepare(int difficulty) {
        var counter = 0;
        byte[] bytes;
        String hashRest;
        var isValid = true;

        do {
            isValid = true;

            hashRest = String.format(
                    HASH_REST_TEMPLATE,
                    System.currentTimeMillis(),
                    URL,
                    randomString(),
                    counter
            );
            bytes = MD.digest(hashRest.getBytes(StandardCharsets.UTF_8));

            for (var i = 0; i < difficulty; i++) {
                if (bytes[i] != 0) {
                    isValid = false;
                    break;
                }
            }
        } while (!isValid);

        return hashRest;
    }

    private static String randomString() {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        var random = new Random();

        return random.ints(leftLimit, rightLimit + 1)
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}
