import React from 'react';
import 'katex/dist/katex.min.css'; // Import CSS bắt buộc
import katex from 'katex';

const MathText = ({ text, className, style }) => {
    if (!text) return null;

    const renderContent = () => {
        const nodes = [];
        const mathPattern = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
        let lastIndex = 0;
        let match;

        while ((match = mathPattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }

            nodes.push({
                type: 'math',
                value: match[1] || match[2],
                displayMode: Boolean(match[1])
            });

            lastIndex = mathPattern.lastIndex;
        }

        if (lastIndex < text.length) {
            nodes.push({ type: 'text', value: text.slice(lastIndex) });
        }

        if (!nodes.length) {
            nodes.push({ type: 'text', value: text });
        }

        return nodes.map((node, index) => {
            if (node.type === 'math') {
                try {
                    const html = katex.renderToString(node.value, {
                        throwOnError: false,
                        displayMode: node.displayMode
                    });
                    return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                    return <span key={index} className="text-danger">{node.value}</span>;
                }
            }

            return <span key={index}>{node.value}</span>;
        });
    };

    return (
        <span className={className} style={{ whiteSpace: 'pre-wrap', ...style }}>
            {renderContent()}
        </span>
    );
};

export default MathText;