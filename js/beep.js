var ctx = new (window.AudioContext || window.webkitAudioContext)();

beep = {		
		initialize : function() {
		}, 
		
		dit : function(duration, callback) {
			beep.beep(duration, callback);
		},
		
		dah : function(duration, callback) {
			beep.beep(duration*3, callback);
		},
		
		beep : function(duration, callback) { 
			if(typeof callback != 'function') {
				callback = function(){};
			} 
			var time = ctx.currentTime;
			console.log('time1: ' + time);
			var oscillator = ctx.createOscillator();   
			oscillator.type = 'sine';
		    oscillator.frequency.value = 600;
		    
		    var gainNode = ctx.createGain();
		    gainNode.gain.setValueAtTime(0, time);
		    
            gainNode.gain.setValueAtTime(0.5, time);
            time += duration;
			console.log('time2: ' + time);
            gainNode.gain.setValueAtTime(0, 5000);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            
            return false;
		}
};

$(document).ready(beep.initialize);