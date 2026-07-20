// Hero Slide 
let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;

function showSlide(index) {
    if (index < 0) {
        currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }

    slides.forEach((slide, i) => {
        const isCurrent = i === currentIndex;
        const scaleFactor = isCurrent ? 1 : 0.8;
        const transformValue = isCurrent ? 'scale(1)' : 'scale(0.8)';
        const widthValue = isCurrent ? '100%' : '80%';


        slide.style.transform = transformValue;
        slide.style.width = widthValue;
        dots[i].classList.toggle('active-dot', isCurrent);
    });

    const translateValue = -currentIndex * 100 + '%';
    document.querySelector('.slider').style.transform = 'translateX( ' + translateValue + ')';
}

function nextSlide() {
    showSlide(currentIndex + 1);
}

function prevSlide() {
    showSlide(currentIndex - 1);
}

function currentSlide(index) {
    showSlide(index);
}

setInterval(nextSlide, 10000);