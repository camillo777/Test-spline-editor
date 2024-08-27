const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const addVertexBtn = document.getElementById('addVertex');
const addSplineBtn = document.getElementById('addSpline');
const colorPicker = document.getElementById('colorPicker');
const widthSlider = document.getElementById('widthSlider');
const curvatureSlider = document.getElementById('curvatureSlider');

canvas.width = 800;
canvas.height = 600;

let vertices = [];
let splines = [];
let selectedSpline = null;

function drawVertex(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
}

function drawSpline(spline) {
    ctx.beginPath();
    ctx.moveTo(spline.start.x, spline.start.y);
    const curve = new Bezier(
        spline.start.x, spline.start.y,
        spline.control1.x, spline.control1.y,
        spline.control2.x, spline.control2.y,
        spline.end.x, spline.end.y
    );
    const points = curve.getLUT(50);
    for (const point of points) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = spline.color;
    ctx.lineWidth = spline.width;
    ctx.stroke();
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const vertex of vertices) {
        drawVertex(vertex.x, vertex.y);
    }
    for (const spline of splines) {
        drawSpline(spline);
    }
}

addVertexBtn.addEventListener('click', () => {
    canvas.addEventListener('click', addVertexHandler);
});

function addVertexHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    vertices.push({ x, y });
    redraw();
    canvas.removeEventListener('click', addVertexHandler);
}

addSplineBtn.addEventListener('click', () => {
    if (vertices.length < 2) {
        alert('Add at least 2 vertices first!');
        return;
    }
    canvas.addEventListener('click', addSplineHandler);
});

function addSplineHandler() {
    if (vertices.length < 2) return;
    const start = vertices[vertices.length - 2];
    const end = vertices[vertices.length - 1];
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const control1 = { x: midX, y: start.y };
    const control2 = { x: midX, y: end.y };
    splines.push({
        start,
        end,
        control1,
        control2,
        color: colorPicker.value,
        width: parseInt(widthSlider.value),
        curvature: parseFloat(curvatureSlider.value)
    });
    redraw();
    canvas.removeEventListener('click', addSplineHandler);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const spline of splines) {
        const curve = new Bezier(
            spline.start.x, spline.start.y,
            spline.control1.x, spline.control1.y,
            spline.control2.x, spline.control2.y,
            spline.end.x, spline.end.y
        );
        if (curve.project({ x, y }).d < 10) {
            selectedSpline = spline;
            updateControls();
            return;
        }
    }
    selectedSpline = null;
    updateControls();
});

function updateControls() {
    if (selectedSpline) {
        colorPicker.value = selectedSpline.color;
        widthSlider.value = selectedSpline.width;
        curvatureSlider.value = selectedSpline.curvature;
    }
}

colorPicker.addEventListener('input', updateSelectedSpline);
widthSlider.addEventListener('input', updateSelectedSpline);
curvatureSlider.addEventListener('input', updateSelectedSpline);

function updateSelectedSpline() {
    if (selectedSpline) {
        selectedSpline.color = colorPicker.value;
        selectedSpline.width = parseInt(widthSlider.value);
        selectedSpline.curvature = parseFloat(curvatureSlider.value);
        updateSplineControlPoints(selectedSpline);
        redraw();
    }
}

function updateSplineControlPoints(spline) {
    const dx = spline.end.x - spline.start.x;
    const dy = spline.end.y - spline.start.y;
    const midX = spline.start.x + dx * 0.5;
    const midY = spline.start.y + dy * 0.5;
    const curvature = spline.curvature * Math.min(Math.abs(dx), Math.abs(dy)) * 0.5;

    spline.control1 = {
        x: midX - curvature * Math.sign(dy),
        y: midY - curvature * Math.sign(dx)
    };
    spline.control2 = {
        x: midX + curvature * Math.sign(dy),
        y: midY + curvature * Math.sign(dx)
    };
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
}
