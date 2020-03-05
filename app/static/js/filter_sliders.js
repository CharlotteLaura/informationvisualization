var sent_slider = document.getElementById('sentiment-slider');
let color_neg = '#f03333',
    color_neut = '#666',
    color_pos = '#7a99c5';


noUiSlider.create(sent_slider, {
    start: [1],
    step: 1,
    range: {
        'min': 0,
        'max': 2
    },
    behaviour: 'tap-drag',
    animate: true,
    animationDuration: 100,
    // pips: {
    //     mode: 'steps',
    //     density: diffDays,
    //     // Force major pips for value.
    //     filter: function () {
    //         return 1;
    //     }
    // }
});

sent_slider.noUiSlider.on('update', function () {

    let handle = d3.select('#sentiment-slider .noUi-handle');

    // Set color
    let val = Number(sent_slider.noUiSlider.get())
    if (val==0){
        handle.style('background-color', color_neg)
    } else if(val==1) {
        handle.style('background-color', color_neut)
    } else {
        handle.style('background-color', color_pos)
    }
})

sent_slider.noUiSlider.on('change', function () {
    let val = Number(sent_slider.noUiSlider.get())
    if (val==0){
        updateSentiment("neg")
    } else if(val==1) {
        updateSentiment("none")
    } else {
        updateSentiment("pos")
    }
})