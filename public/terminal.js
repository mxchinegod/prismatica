/* initialize autotyper */
function typeWrap(text){
    var typer = new autoTyper({
        selector: '.typer-target',
        words: [text],
        charSpeed: 5,
        delay: 2100,
        loop: false,
        flipflop: false
    })
    
    typer.start()
}
typeWrap("try uploading a document")