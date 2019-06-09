$(document).ready(function () {

    $('.burger').click(function() {
        $('header ul').slideToggle();
    });

    'use strict';
    setTimeout(()=>main(), 1000);
    function main() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
        const synth = window.speechSynthesis;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'ru-RU';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.start();

        recognition.onresult = (event) => {
            const res = (event.results[0][0].transcript);
            for (let el of event.results){
                console.info(el[0].transcript);
                if (el[0].transcript.toLowerCase().indexOf('главная')+1 || el[0].transcript.toLowerCase().indexOf('главное')+1){
                    window.open('/lk/main/','_self');
                }else if (el[0].transcript.toLowerCase().indexOf('чат')+1 || el[0].transcript.toLowerCase().indexOf('наставник')+1 ){
                    window.open('/lk/chat/','_self');
                }
            }
        };
    }

    $(document).keydown(function (e) {
        if(e.keyCode === 32){
            e.preventDefault();
            window.location.replace("/lk/main/");
        }
    });


});
