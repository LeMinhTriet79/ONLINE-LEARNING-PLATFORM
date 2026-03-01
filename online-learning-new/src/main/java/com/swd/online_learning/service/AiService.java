package com.swd.online_learning.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private ChatLanguageModel chatModel;

    @PostConstruct
    public void init() {
        this.chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-2.5-flash") // Sử dụng model xịn nhất bạn đã test
                .temperature(0.7) // 0.7 giúp AI trả lời linh hoạt, tự nhiên nhưng không bịaa đặt
                .build();
    }

    public String getQuizHint(String questionContent, String studentQuery) {
        String systemPrompt = "Bạn là một gia sư AI thân thiện, tận tâm giúp học sinh làm bài trắc nghiệm. " +
                "NGUYÊN TẮC TỐI THƯỢNG: TUYỆT ĐỐI KHÔNG ĐƯỢC CHỈ ĐÍCH DANH ĐÁP ÁN ĐÚNG LÀ GÌ. " +
                "Nhiệm vụ của bạn là: Giải thích ngắn gọn từ khóa trong câu hỏi, đưa ra gợi ý, dẫn dắt tư duy để học sinh tự suy luận ra câu trả lời. " +
                "Trả lời ngắn gọn, súc tích (dưới 150 chữ), định dạng bằng Markdown cho dễ đọc. " +
                "Nếu học sinh cố tình hỏi thẳng đáp án (VD: 'Chọn câu nào', 'Đáp án là gì'), hãy từ chối khéo léo và đặt câu hỏi gợi mở ngược lại cho họ.\n\n";

        String context = "Ngữ cảnh bài tập (Câu hỏi + Các đáp án): " + questionContent + "\n" +
                "Học sinh hỏi: " + studentQuery;

        return chatModel.generate(systemPrompt + context);
    }
}