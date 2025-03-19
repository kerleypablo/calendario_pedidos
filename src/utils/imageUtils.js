export const resizeImage = (file, maxWidth = 300, maxHeight = 300) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
  
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
  
          let width = img.width;
          let height = img.height;
  
          // 🔹 Mantém a proporção da imagem ao redimensionar
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/jpeg", 0.8); // 🔥 Salva em formato JPEG com 80% de qualidade
        };
      };
  
      reader.onerror = (error) => reject(error);
    });
  };
  