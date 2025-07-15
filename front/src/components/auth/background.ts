import { RefObject } from "react";

type Dot = { x: number; y: number; vx: number; vy: number };

export const dotsBackground = (canvasRef: RefObject<HTMLCanvasElement>) => {
	const canvas = canvasRef.current;
	if (!canvas) return;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	document.querySelector("html")?.removeAttribute("onclick");

	const resizeCanvas = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	};

	resizeCanvas();
	window.addEventListener("resize", resizeCanvas);

	const dots: Dot[] = [];
	const dotCount = 100;
	const dotSize = 2;
	const connectionDistance = 100;

	for (let i = 0; i < dotCount; i++) {
		dots.push({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			vx: (Math.random() - 0.5) * 0.5,
			vy: (Math.random() - 0.5) * 0.5,
		});
	}

	const animate = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		dots.forEach((dot) => {
			dot.x += dot.vx;
			dot.y += dot.vy;

			if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
			if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

			ctx.beginPath();
			ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.fill();

			dots.forEach((otherDot) => {
				const distance = Math.hypot(dot.x - otherDot.x, dot.y - otherDot.y);
				if (distance < connectionDistance) {
					ctx.beginPath();
					ctx.moveTo(dot.x, dot.y);
					ctx.lineTo(otherDot.x, otherDot.y);
					ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - (distance / connectionDistance) * 0.2})`;
					ctx.stroke();
				}
			});
		});

		requestAnimationFrame(animate);
	};

	animate();

	return () => {
		window.removeEventListener("resize", resizeCanvas);
	};
};
