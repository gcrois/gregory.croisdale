import React, { useState } from 'react';
import {QRCodeCanvas} from 'qrcode.react';
import sanitize from 'sanitize-filename';

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState<string>('https://g.regory.dev');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  return (
    <div>
      <h2>QR Code Generator</h2>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Enter text to generate QR code"
      />
        <div style={{ marginTop: '20px' }}>
            <QRCodeCanvas
                value={text}
                marginSize={1}
                ref={canvasRef}
            />
        </div>
        <div style={{ marginTop: '20px' }}>
            <button onClick={() => canvasRef.current?.toBlob((blob) => {
                const url = URL.createObjectURL(blob!);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${sanitize(text)}-qr.png`
                a.click();
                URL.revokeObjectURL(url);
            })}>Download QR Code</button>
            <button onClick={() => {
                canvasRef.current?.toBlob((blob) => {
                    try {
                        navigator.clipboard.write([
                            new ClipboardItem({
                                'image/png': blob!
                            })
                        ]);
                    } catch (error) {
                        console.error(error);
                    }
                });
            }}>
                Copy QR Code
            </button>
        </div>
    </div>
  );
};

export default QRCodeGenerator;
