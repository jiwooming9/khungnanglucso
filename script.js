// Form submission
function submitForm(e) {
    e.preventDefault();
    
    // Check if all questions in the current section are answered
    const currentSectionEl = sections[currentSection];
    const questionNames = new Set();
    
    // Lấy tất cả các tên câu hỏi trong section hiện tại
    currentSectionEl.querySelectorAll('input[type="radio"][required]').forEach(radio => {
        questionNames.add(radio.getAttribute('name'));
    });
    
    // Kiểm tra từng câu hỏi
    let allAnswered = true;
    for (const name of questionNames) {
        const radioButtons = currentSectionEl.querySelectorAll(`input[name="${name}"]`);
        const isAnswered = Array.from(radioButtons).some(radio => radio.checked);
        
        if (!isAnswered) {
            allAnswered = false;
            break;
        }
    }
    
    if (allAnswered) {
        // Hiển thị loading
        submitBtnText.classList.add('hidden');
        submitLoader.classList.remove('hidden');
        
        // Chuẩn bị dữ liệu
        const formData = new FormData(form);
        const data = {
          fullName: document.getElementById('fullName').value,
          position: document.getElementById('position').value,
          department: document.getElementById('department').value,
          timestamp: new Date().toISOString()
        };
        
        // Thêm câu trả lời
        for (const [key, value] of formData.entries()) {
          if (key.startsWith('q')) {
            data[key] = value;
          }
        }
        
        /* Xóa phần này nếu JSONP hoạt động tốt
        // Giả lập gửi dữ liệu để test
        setTimeout(function() {
            // Ẩn loading
            submitBtnText.classList.remove('hidden');
            submitLoader.classList.add('hidden');
            
            // Hiển thị thông báo thành công
            form.innerHTML = `
              <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-2xl font-bold mb-4">Cảm ơn đồng chí đã hoàn thành khảo sát!</h2>
                <p class="mb-6">Kết quả của đồng chí đã được ghi nhận thành công.</p>
                <button type="button" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onclick="window.location.reload()">
                  Thực hiện khảo sát mới
                </button>
              </div>
            `;
            showToast('Đã lưu kết quả thành công!', 'success');
            
            // In dữ liệu vào console để kiểm tra
            console.log("Dữ liệu khảo sát:", data);
        }, 1500);
        */
        
        // Sử dụng JSONP
        const script = document.createElement('script');
        const callback = 'jsonpCallback_' + new Date().getTime();
        
        // Định nghĩa hàm callback
        window[callback] = function(response) {
          // Ẩn loading
          submitBtnText.classList.remove('hidden');
          submitLoader.classList.add('hidden');
          
          if (response.success) {
            // Hiển thị thông báo thành công
            form.innerHTML = `
              <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-2xl font-bold mb-4">Cảm ơn đồng chí đã hoàn thành khảo sát!</h2>
                <p class="mb-6">Kết quả của đồng chí đã được ghi nhận thành công.</p>
                <button type="button" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onclick="window.location.reload()">
                  Thực hiện khảo sát mới
                </button>
              </div>
            `;
            showToast('Đã lưu kết quả thành công!', 'success');
          } else {
            showToast('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại sau.', 'error');
            console.error('Error saving results:', response.error);
          }
          
          // Xóa callback và script element
          delete window[callback];
          document.body.removeChild(script);
        };
        
        // Tạo URL với các tham số
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(data));
        params.append('callback', callback);
        
        // In ra console để debug
        console.log("Đang gửi dữ liệu:", data);
        console.log("URL Google Script:", 'https://script.google.com/macros/s/AKfycbwNX3TmzzoU77XsguVohUzzCmBDdQEN7DLIv6wt_AyJ_oON6ZM5lEGSgUSipBd-k_wu/exec?' + params.toString());
        
        // Thêm script vào document
        script.src = 'https://script.google.com/macros/s/AKfycbwNX3TmzzoU77XsguVohUzzCmBDdQEN7DLIv6wt_AyJ_oON6ZM5lEGSgUSipBd-k_wu/exec?' + params.toString();
        document.body.appendChild(script);
        
        // Xử lý lỗi
        script.onerror = function() {
          // Ẩn loading
          submitBtnText.classList.remove('hidden');
          submitLoader.classList.add('hidden');
          
          showToast('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại sau.', 'error');
          console.error('Script loading error');
          
          // Xóa callback và script element
          delete window[callback];
          document.body.removeChild(script);
        };
    } else {
        showToast('Vui lòng trả lời tất cả các câu hỏi trước khi hoàn thành.', 'error');
    }
}
