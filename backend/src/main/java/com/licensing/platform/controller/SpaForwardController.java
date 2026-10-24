package com.licensing.platform.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/citizen-dashboard",
            "/explore-services",
            "/my-applications",
            "/officer-queue",
            "/admin-dashboard",
            "/notifications",
            "/profile",
            "/help",
            "/research-benchmark"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
