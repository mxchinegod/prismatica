$(document).ready(function () {
    $("#question").on('keyup', (val)=>{
        $("#question").val().length > 3 && $("#processButton").attr("data-files").length>0 ? $("#answerButton").show() : $("#answerButton").hide()
    })
    get_uploads()
    get_tasks()
    $("#file_upload").change(function (event) {
        var file = event.target.files[0];
        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
            url: '/upload_file',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $("#processButton").attr("data-files", [`${response.filename}`])
                typeWrap(`successful upload of ${response.filename}, try processing document`)
                get_uploads()
            },
            error: function (error) {
                console.log(error)
                typeWrap(error.responseJSON.detail)
            }
        });
    })
})

function get_uploads() {
    $.ajax({
        type: "GET",
        url: "/uploads",
        success: function (data) {
            var documentsList = $("#documents-list");
            for (var i = 0; i < data.length; i++) {
                var document = data[i];
                var listItem = $("<li class='foo__item'>");
                var link = $("<a>");
                link.attr("href", `javascript:$('#processButton').attr('data-files', ['${document.filename}']);typeWrap("${document.filename} selected for questioning");`);
                link.text(document.filename);
                listItem.append(link);
                documentsList.append(listItem);
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}

function get_tasks() {
    $.ajax({
        type: "GET",
        url: "/tasks",
        success: function (data) {
            const smallTags = data.map(task => {
                let color = task.status === 'done' ? 'rgb(0, 204, 255)' : '#bfff00';
                let progress = task.status === 'done' ? '<div class="success-animation"><svg class="checkmark" style="max-width:10px;max-height:10px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg></div>' : '<div class="rainbow-loader-border" style="max-width:10px;max-height:10px"><div class="border"></div><div class="glow"></div></div>'
                return `<div>${progress} <small id="${task._id}" style="color:${color};"><a href="javascript:results('${task._id}');">${task._id}</a></small></div><br>`;
            });
            $("#jobs").html(smallTags.join(''));
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}

function results(id) {
    $.ajax({
        type: "GET",
        url: "/task_status/"+id,
        success: function (data) {
            const result = data.result.reduce((acc, str) => acc + str, '');
            $("#resultsTitle").html('Your results')
            $("#resultsBody").html(result)
            $("#popup-article").show();
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
    
}

function process(newSpeed, newSpikes, newProcessing) {
    if ($("#question").val().length<1) {
        typeWrap("No question asked")
    } else {
        blobWarp(newSpeed, newSpikes, newProcessing)
        $.ajax({
            url: '/find_similar_documents',
            method: 'POST',
            data: JSON.stringify({ 'filename': $("#processButton").attr("data-files"), 'question': $("#question").val() }),
            dataType: "json",
            contentType: "application/json",
            processData: false,
            success: function (response) {
                var task = response.task_id
                typeWrap(`job for ${$("#processButton").attr("data-files")} created`)
                get_tasks()
                $("#popup").show();
            },
            error: function (error) {
                console.log(error)
                if (error.responseJSON.detail[0].msg) {
                    typeWrap(error.responseJSON.detail[0].msg)
                } else {
                    typeWrap(error.responseJSON.detail)
                }
            }
        });
    }
}

function blobWarp(newSpeed, newSpikes, newProcessing) {
    // Select the speed, spikes, and processing sliders
    const speedSlider = document.querySelector('input[name="speed"]');
    const spikesSlider = document.querySelector('input[name="spikes"]');
    const processingSlider = document.querySelector('input[name="processing"]');

    // Define the new values and the amount to increment each slider value each time
    const speedIncrement = (newSpeed - speedSlider.value) / 20; // 40 steps over 2 seconds

    const spikesIncrement = (newSpikes - spikesSlider.value) / 180; // 40 steps over 2 seconds

    const processingIncrement = (newProcessing - processingSlider.value) / 20; // 40 steps over 2 seconds

    // Use setInterval() to incrementally update each slider value
    let currentSpeed = parseFloat(speedSlider.value);
    let currentSpikes = parseFloat(spikesSlider.value);
    let currentProcessing = parseFloat(processingSlider.value);

    const sliderInterval = setInterval(() => {
        currentSpeed += speedIncrement;
        currentSpikes += spikesIncrement;
        currentProcessing += processingIncrement;

        speedSlider.value = currentSpeed.toFixed(1);
        spikesSlider.value = currentSpikes.toFixed(2);
        processingSlider.value = currentProcessing.toFixed(2);

        // Stop the interval when all sliders have reached their target values
        if (currentSpeed >= newSpeed && currentSpikes >= newSpikes && currentProcessing >= newProcessing) {
            clearInterval(sliderInterval);
        }
    }, 1); // 50 milliseconds between updates
}