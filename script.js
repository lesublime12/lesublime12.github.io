window.addEventListener("DOMContentLoaded", ()=>{

    DOMApplications = document.getElementById("apps");
    
    const apps = [
        {name:"Mandelbrot explorer",dir:"image_processing/fractal/index.html"},
    ];

    DOMApplications.appendChild(document.createElement("br"));

    for (let app of apps) {

        let anchor = document.createElement("a");
        anchor.href = app.dir;
        anchor.innerText = app.name;
        anchor.id = "app";
        
        DOMApplications.appendChild(anchor);
        DOMApplications.appendChild(document.createElement("br"));
    }
});