$(document).ready(function () {

    'use strict';
    setTimeout(()=>main(), 1000);
    function main() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
        const synth = window.speechSynthesis;
        const field = document.querySelector('.speech-recognition__words');
        const microphoneIcon = document.querySelector('.speech-recognition__icon');
        let txtToSay = new SpeechSynthesisUtterance('Привет.');
        synth.speak(txtToSay);
    }

    // const recognition = new SpeechRecognition();
    // recognition.continuous = true;
    // recognition.lang = 'ru-RU';
    // recognition.interimResults = true;
    // recognition.maxAlternatives = 1;

    // recognition.start();
    // field.textContent = 'Ready to receive command.';

    // recognition.onresult = (event) => {
    //     const res = (event.results[0][0].transcript);
    //     for (let el of event.results){
    //         console.info(el[0].transcript);
    //         field.textContent = `Результат: ${el[0].transcript}` ;
    //         if (el[0].transcript.toLowerCase().indexOf('войти')+1){
    //             window.open('sign_up.html','_self');
    //         }else if (el[0].transcript.toLowerCase().indexOf('яндекс')+1){
    //             window.open('https://yandex.com','_self');
    //         }
    //     }
    // };

    $(document).keydown(function (e) {
        if(e.keyCode === 32){
            e.preventDefault();
            window.location.replace("/signup/");
        }
    });


});
