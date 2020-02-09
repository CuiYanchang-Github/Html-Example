var w = c.width = window.innerWidth,
		h = c.height = window.innerHeight,
		ctx = c.getContext( '2d' ),
		
		opts = {
			dist: 15, //units
			sideLen: 25, //points
			waveIncrement: .02,
			distanceWaveFactor: 50,
			colorIncrement: 1,
			colorMultiplier: 100,
			
			baseY: 60,
			addedY: 50,
			depth: 400,
			maxDepth: 700,
			
			rotYVel: .01,
			
			focalLength: 250,
			vanishPoint: {
				x: w / 2,
				y: h / 2
			}
		},
		calc = {
			
			difX: Math.sqrt( 3 ) * opts.dist, // height of a equilateral triangle
			difZ: opts.dist * 3 / 2, // side of a triangle ( because it goes down to a vertex ) then half a side of the triangle in the hex below: s + s/2 = s*3/2
			translate: {
				x: -Math.sqrt( 3 ) * opts.dist * opts.sideLen / 2,
				z: -opts.dist * 3 / 2 * opts.sideLen / 2,
				y: opts.baseY
			},
			rotY: {}
		},
		
		rotY = 0,
		points = [],
		tick = 0,
		waveTick = 0,
		colorTick = 0;

function setup(){
	
	// put hexagon points in the array
	for( var i = 0; i < opts.sideLen; ++i ){
		var shiftZ = ( ( i + 1 ) % 2 ) / 2;
		
		for( var j = 0; j < opts.sideLen; ++j ){
			
			var shiftX = ( j % 2 ) / 2;
			points.push( new Point( 
				( j + shiftZ ) * calc.difX + calc.translate.x,
				calc.translate.y,
				( i + shiftX ) * calc.difZ + calc.translate.z ) );
			
			// connect
			if( points[ i * opts.sideLen + j - 1 ] && j > 0 )
				points[ points.length - 1 ].link( points[ i * opts.sideLen + j - 1 ] );
			
			if( points[ ( i - 1 ) * opts.sideLen + j ] )
				points[ points.length - 1 ].link( points[ ( i - 1 ) * opts.sideLen + j ] );
		}
	}
}

function Point( x, y, z ){
	
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.screen = {
		x: 0,
		y: 0
	};
	
	this.distFromCenter = Math.sqrt( x*x + z*z ) / opts.distanceWaveFactor;
	
	this.links = [];
}
Point.prototype.link = function( point ){
	this.links.push( point );
}
Point.prototype.step = function(){
	
	var wave = -Math.sin( waveTick + this.distFromCenter ),
			x = this.x,
			y = this.y + opts.addedY * wave,
			z = this.z;
	
	// apply rotation around Y axis
	var x1 = x;
	x = x * calc.rotY.cos - z * calc.rotY.sin;
	z = z * calc.rotY.cos + x1 * calc.rotY.sin;
	
	// push back
	z += opts.depth;
	
	if( z < 0 ) 
		return false;
	
	// calculate screen position
	var scale = opts.focalLength / z;
	this.screen.x = opts.vanishPoint.x + scale * x;
	this.screen.y = opts.vanishPoint.y + scale * y;
	
	ctx.strokeStyle = 'hsla( hue, 80%, 50%, alp )'
		.replace( 'hue', colorTick + wave * opts.colorMultiplier )
		.replace( 'alp', 1 / this.distFromCenter );
	
	ctx.beginPath();
	for( var i = 0; i < this.links.length; ++i ){
		ctx.moveTo( this.screen.x, this.screen.y );
		ctx.lineTo( this.links[ i ].screen.x, this.links[ i ].screen.y );
	}
	ctx.stroke();
}
function anim(){
	
	window.requestAnimationFrame( anim );
	
	++tick;
	colorTick += opts.colorIncrement;
	waveTick += opts.waveIncrement;
	
	ctx.fillStyle = 'black';
	ctx.fillRect( 0, 0, w, h );
	
	rotY += opts.rotYVel;
	calc.rotY.cos = Math.cos( rotY );
	calc.rotY.sin = Math.sin( rotY );
	
	points.map( function( point ){ point.step(); } );
}
setup();
anim();

window.addEventListener( 'resize', function(){
	
	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;
	
	opts.vanishPoint.x = w / 2;
	opts.vanishPoint.y = h / 2;
})