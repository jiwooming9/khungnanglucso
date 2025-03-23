document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('surveyForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitLoader = document.getElementById('submitLoader');
    const progressBar = document.getElementById('progressBar');
    const sections = document.querySelectorAll('.question-section');
    
    let currentSection = 0;
    const totalSections = sections.length;
    
    // Show first section
    showSection(currentSection);
    updateProgressBar();
    
    // Event listeners
    prevBtn.addEventListener('click', previousSection);
    nextBtn.addEventListener('click', nextSection);
    form.addEventListener('submit', submitForm);
    
    // Navigation functions
    function showSection(index) {
        sections.forEach((section, i) => {
            section.classList.toggle('hidden', i !== index);
        });
        
        prevBtn.classList.toggle('hidden', index === 0);
        nextBtn.classList.toggle('hidden', index === totalSections - 1);
        submitBtn.classList.toggle('hidden', index !== totalSections - 1);
        
        updateProgressBar();
    }
    
    function previousSection() {
        if (currentSection > 0) {
            currentSection--;
            showSection(currentSection);
            window.scrollTo(0, 0);
        }
    }
    
    function nextSection() {
        const currentSectionEl = sections[currentSection];
        const questions = currentSectionEl.querySelectorAll('input[type="radio"][required]');
        const questionsPerGroup = {};
        
        // Group questions by name
        questions.forEach(question => {
            const name = question.getAttribute('name');
            if (!questionsPerGroup[name]) {
                questionsPerGroup[name] = [];
            }
            questionsPerGroup[name].push(question);
        });
        
        // Check if at least one option is selected for each question group
        let allAnswered = true;
        for (const name in questionsPerGroup) {
            const isAnswered = Array.from(questionsPerGroup[name]).some(q => q.checked);
            if (!isAnswered) {
                allAnswered = false;
                break;
            }
        }
        
        if (allAnswered) {
            if (currentSection < totalSections - 1) {
                currentSection++;
                showSection(currentSection);
                window.scrollTo(0, 0);
            }
        } else {
            showToast('Vui lòng trả lời tất cả các câu hỏi trước khi tiếp tục.', 'error');
        }
    }
    
    function updateProgressBar() {
        const progress = ((currentSection + 1) / totalSections) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Show toast message
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Force reflow to enable transition
        toast.offsetHeight;
        
        // Show toast
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Form submission
    function submitForm(e) {
        e.preventDefault();
        
        // Check if all questions in the current section are answered
        const currentSectionEl = sections[currentSection];
        const questions = currentSectionEl.querySelectorAll('input[type="radio"][required]');
        const questionsPerGroup = {};
        
        // Group questions by name
        questions.forEach(question => {
            const name = question.getAttribute('name');
            if (!questionsPerGroup[name]) {
                questionsPerGroup[name] = [];
            }
            questionsPerGroup[name].push(question);
        });
        
        // Check if at least one option is selected for each question group
        let allAnswered = true;
        for (const name in questionsPerGroup) {
            const isAnswered = Array.from(questionsPerGroup[name]).some(q => q.checked);
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
            
            // Thêm script vào document
            script.src = 'https://script.google.com/macros/s/AKfycbzA5PEC-TXs9m3hBY4iO4RtrCRq2yI2Yf-ihojoyTYJpQWWBoCnndFsF7xHGB-r01LW/exec?' + params.toString();
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
});
