package com.swd.online_learning.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String publicId = UUID.randomUUID().toString();

        Map params = ObjectUtils.asMap(
                "public_id", publicId,
                "resource_type", "auto",
                "folder", "online_learning_courseware",
                "access_mode", "public", // <--- BẮT BUỘC CÓ DÒNG NÀY
                "type", "upload"
        );

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        return uploadResult.get("secure_url").toString();
    }
}