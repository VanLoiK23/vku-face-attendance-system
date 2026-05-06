FROM node:20-alpine AS builder
WORKDIR /app
# PHẢI THÊM "Front-end-ReactJS/" vào trước tên file
COPY Front-end/package*.json ./
RUN npm install

# Copy toàn bộ code frontend vào
COPY Front-end/ . 
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# GIỜ THÌ DÒNG NÀY SẼ CHẠY NGON (vì context đã bao hàm thư mục nginx)
COPY nginx/nginx.conf /etc/nginx/nginx.conf
# Cấu hình Nginx để hỗ trợ React Router (tùy chọn nhưng nên có)
RUN printf "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]