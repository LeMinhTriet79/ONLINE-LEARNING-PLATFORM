import React from 'react';
import 'katex/dist/katex.min.css'; // Import CSS bắt buộc
import katex from 'katex';

const MathText = ({ text }) => {
    if (!text) return null;

    // Hàm render: Tách chuỗi dựa trên dấu $
    // Ví dụ: "Tìm $x$ biết $x^2=4$" -> ["Tìm ", "x", " biết ", "x^2=4"]
    const renderContent = () => {
        // Regex để bắt nội dung trong $...$
        const parts = text.split(/\$(.*?)\$/g);

        return parts.map((part, index) => {
            // Các phần tử ở vị trí lẻ (1, 3, 5...) chính là công thức toán
            if (index % 2 === 1) {
                try {
                    const html = katex.renderToString(part, {
                        throwOnError: false,
                        displayMode: false // false = hiển thị cùng dòng (inline)
                    });
                    return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                    return <span key={index} className="text-danger">{part}</span>;
                }
            }
            // Các phần tử chẵn là text bình thường
            return <span key={index}>{part}</span>;
        });
    };

    return <span>{renderContent()}</span>;
};

export default MathText;