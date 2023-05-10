$(document).ready(function () {
    $('.back').click(function () {
        $(this).toggleClass('show');
        $('.toolbox-container').toggleClass($('.toolbox-container').attr("class").split(/\s+/).includes("startup")?'shutdown':'startup');
        $(this).html($(this).html()=="minimize"?"maximize":"minimize")
    });
});