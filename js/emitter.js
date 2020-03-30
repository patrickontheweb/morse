/**
 * Handle playing the sounds of the morse code.
 * This is still tightly coupled with morse, not just any sounds, but at least abstracts
 * out the actual implementation.
 */
emitter = {			
		emit : function(options) {	
			// Set up audio context
			var ctx = emitter.createContext();
		    var gainNode = ctx.createGain(); 
		    
		    // Start time
		    var t = ctx.currentTime;
		    
		    // Dit speed 
		    var dit = 1.2/options.wpm;
			
		    // Start volume at zero
		    gainNode.gain.setValueAtTime(0, t);
		    
		    // Set gain steps for each note in the input.
		    // A dit is one unit. 
		    // 1 unit after note, 3 units after letter, 7 units after word.
		    for(var i = 0; i < options.input.length; ++i) {
		    	switch(options.input.charAt(i)) {
		            case '.':
		            	emitter.setGainStep(gainNode, t, t += dit);
		                t += dit;
		                break;
		            case '-':
		            	emitter.setGainStep(gainNode, t, t += dit*3);
		                t += dit;
		                break;
		            case options.letterSeparator:
		                t += 3 * dit;
		                break;
		            case options.wordSeparator:
		                t += 7 * dit;
		                break;
		        }
		    };
		    
		    emitter.play(gainNode, ctx, options.type, options.frequency);
		},	
		
		play : function(gainNode, ctx, type, frequency) {
			// Set up the oscillator
			var oscillator = ctx.createOscillator();
			oscillator.type = type;
			oscillator.frequency.value = frequency;
			
			// Connect the oscillator and gain
		    oscillator.connect(gainNode);
		    gainNode.connect(ctx.destination);

		    // Play the notes
		    oscillator.start();
		},	
		
		setGainStep : function(gainNode, start, stop) {
            gainNode.gain.setValueAtTime(1, start);
            gainNode.gain.setValueAtTime(0, stop);
		},
		
		createContext : function() {
			return new (window.AudioContext || window.webkitAudioContext)();
		},	
};