window.addEventListener("DOMContentLoaded", () => {
	
	const DOMCanvas = document.getElementById("canvas"),
		  DOMStepX = document.getElementById("step-x"),
		  DOMStepY = document.getElementById("step-y"),
		  DOMStepZ = document.getElementById("step-z");

	const context = DOMCanvas.getContext("2d");
	
	let user_x = -.5,
		user_y = 0,
		user_z = 150,
		user_z_inverse = 1/user_z,
		iteration = 1000,
		bailout = 8192;

	let step_x = 1,
		step_y = 1,
		step_z = 10;
	
	DOMStepX.value = step_x,
	DOMStepY.value = step_y,
	DOMStepZ.value = step_z;
	
	const CANVAS_WIDTH  = 512,
		  CANVAS_HEIGHT = 512,
		  CANVAS_HALF_WIDTH  = CANVAS_WIDTH  * .5,
		  CANVAS_HALF_HEIGHT = CANVAS_HEIGHT * .5,
		  CANVAS_AREA   = CANVAS_WIDTH * CANVAS_HEIGHT;
		
	canvas.width  = CANVAS_WIDTH,
	canvas.height = CANVAS_HEIGHT;

	const square_complex = (a, b) => [a*a-b*b, 2*a*b];
	const multiply_complex = (a, b, c, d) => [a*c - b*d, a*d + b*c];
	const divide_complex = (a, b, c, d) => {
		let t = c*c + d*d;
		return [(a*c + b*d)/t, (b*c - a*d)/t];
	};
	const inverse_complex = (a, b) => {
		let t = a*a + b*b;
		return [a/t, -b/t];
	};
	const     sine_complex = (a, b) => [Math.sin(a)*Math.cosh(b),  Math.cos(a)*Math.sinh(b)];
	const   cosine_complex = (a, b) => [Math.cos(a)*Math.cosh(b), -Math.sin(a)*Math.sinh(b)];
	const  tangent_complex = (a, b) => {
		let sa = Math.sin(a),
			ca = Math.cos(a),
			sb = Math.sinh(b),
			cb = Math.cosh(b),
			t = ca * cb + sa * sb;
		return [sa * cb / t, ca * sb / t];
	};
	const    hsine_complex = (a, b) => [Math.sinh(a)*Math.cos(b),  Math.cosh(a)*Math.sin(b)];
	const  hcosine_complex = (a, b) => [Math.cosh(a)*Math.cos(b), -Math.sinh(a)*Math.sin(b)];
	const htangent_complex = (a, b) => {
		let sr = Math.sinh(a),
			cr = Math.cosh(a),
			sc = Math.sinh(b),
			cc = Math.cosh(b),
			t = cr * cr + cc * cc;
		return [sr * cc / t, sc * cr / t];
	};
	const   power_complex = (a, b, c, d) => {
		let r = Math.sqrt(a * a + b * b),
			t = Math.atan2(b, a),
			e = (r ** c) * Math.exp(-d * t),
			te = c * t + d * Math.log(r);
		return [e * Math.cos(te), e * Math.sin(te)];
	};
	const     log_complex = (a, b) => [Math.log(Math.sqrt(a * a + b * b)), Math.atan2(b, a)];

	const sleep = async ms => new Promise(r=>setTimeout(r,ms));
	const log = s => (document.getElementById("info").innerText = `X: ${user_x}\nY: ${user_y}\nZ: ${user_z}\n\nIterations:${iteration}\n${s}`);

	const image_data = new ImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
	
	let computing = false;
	
	async function render() {
		
		computing = false;

		image_data.data.fill(0);
		log("Computing...\n");
		await sleep(125);
		
		computing = true;
		for (let i = 0, r, c, tr, tc, t, x, y, D = image_data.data, L = CANVAS_AREA*4; i < L && computing; i+=4) {
			
			x = (i >> 2) % CANVAS_WIDTH,
			y = (i >> 2) / CANVAS_WIDTH | 0;
			
			dx = (x - CANVAS_HALF_WIDTH  + user_x * user_z) * user_z_inverse,
			r = dx,
			
			dy = (y - CANVAS_HALF_HEIGHT + user_y * user_z) * user_z_inverse,
			c = dy;
			
			for (let j = 1; j < iteration; j++) {
				
				[r, c] = square_complex(r, c);
				[r, c] = [r+dx, c+dy];

				if (r * r + c * c > bailout) {
					
					//D[i  ] = (Math.tanh((j - 255) * .05) + 1) * 128,
					//D[i+1] = (Math.tanh((j -  63) * .05) + 1) * 128,
					//D[i+2] = (Math.tanh((j - 127) * .05) + 1) * 128;
					//D[i  ] = j * 2,
					//D[i+1] = j * 8,
					//D[i+2] = j * 32;

					D[i  ] = (Math.sin((j*.75 - 31) * .05) + 1) * 128,
					D[i+1] = (Math.sin((j*.75 - 15) * .05) + 1) * 128,
					D[i+2] = (Math.sin((j*.75 -  3) * .05) + 1) * 128;
					break;
				}
			}
			
			if (i % (L >> 5) === 0) {
			
				let percent = i/L*100|0;
				log(`Computing... ${percent}%\n[${"#".repeat(Math.ceil(percent/2))}${".".repeat((100-percent)/2|0)}]`);
				context.putImageData(image_data, 0, 0);
				await sleep(1);
			}

			D[i+3] = 255;
		}
		
		computing = false;
		
		log("Done.\n");
		
		context.putImageData(image_data, 0, 0);
	}
	
	DOMStepX.addEventListener("keyup", e => {
	
		step_x = +e.target.value;
	});
	
	DOMStepY.addEventListener("keyup", e => {
	
		step_y = +e.target.value;
	});
	
	DOMStepZ.addEventListener("keyup", e => {
	
		step_z = +e.target.value;
	});
	
	window.addEventListener("keypress", e => { // TODO iteration
		
		//console.log(e);
		if (e.charCode === 43) { //  Numpad + Zoom+
			
			user_z += step_z;
			user_z_inverse = 1/user_z;
			render();
		}
		else if (e.charCode === 45) { //  Numpad - Zoom-
			
			user_z -= step_z;
			user_z_inverse = 1/user_z;
			render();
		}
		else if (e.charCode === 56) { //  Numpad 8 Up
			
			user_y -= step_y / user_z;
			render();
		}
		else if (e.charCode === 50) { //  Numpad 2 Down
			
			user_y += step_y / user_z;
			render();
		}
		else if (e.charCode === 54) { //  Numpad 6 Right
			
			user_x += step_x / user_z;
			render();
		}
		else if (e.charCode === 52) { //  Numpad 4 Left
			
			user_x -= step_x / user_z;
			render();
		}
		else if (e.charCode === 55) { //  Numpad 7 Manuel render
			
			render();
		}
	});

	render();
});