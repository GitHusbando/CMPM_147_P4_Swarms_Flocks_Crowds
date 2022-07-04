let flock;
let food_array;
let pheremone_array;

let CANVAS_X = 640;
let CANVAS_Y = 360;

let HOME_X = CANVAS_X/2;
let HOME_Y = CANVAS_Y/2

let OBSTACLE_SIZE = 30;

let FOOD_PER_DOT = 50;
let FOOD_DOT_SIZE = 15;

let PHEREMONE_STRENGTH = 2000;
let PHEREMONE_RATE = 15;
let PHEREMONE_DOT_SIZE = 5;

let keypressedlastframe = false;

function setup() {
  createCanvas(CANVAS_X, CANVAS_Y);
  createP("Drag the mouse to generate new ants.");
  createP("Press F to create a piece of food.");
  createP("Press O to create an obstacle. (The ants aren't very good at walking around them.)");

  flock = new Flock();
  // Add an initial set of boids into the system
  
  food_array = [];
  //array for food
  
  pheremone_array = [];
  //array for pheremones
  
  obstacle_array = [];
  //array for obstacles
  
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }
}

function draw() {
	//check for key release
	if (keypressedlastframe && !keyIsPressed) {
		if (key == 'F' || key == 'f') {
			food_array.push([createVector(mouseX, mouseY), FOOD_PER_DOT]);
		}
		else if (key == 'O' || key == 'o') {
			obstacle_array.push([createVector(mouseX, mouseY), OBSTACLE_SIZE]);
		}
		keypressedlastframe = false;
	}
	
	if (keyIsPressed) {
		keypressedlastframe = true;
	}
	
	background(70, 50, 30);
  
	//draw an anthill at the center
	fill(140, 130, 90);
	stroke(120, 110, 70);
	circle(HOME_X, HOME_Y, 50);
	fill(80, 70, 30)
	stroke(120, 110, 70);
	circle(HOME_X, HOME_Y, 10);
  
	//process every pheremone dot
	fill(25);
	stroke(25);
  
	for (let i = 0; i < pheremone_array.length; i++) {
	  if (pheremone_array[i][1] == 0) {
		  pheremone_array.splice(i, 1); //should remove 1 element starting at i
	  }
	  else
	  {
		  pheremone_array[i][1]--;
		  circle(pheremone_array[i][0].x, pheremone_array[i][0].y, PHEREMONE_DOT_SIZE*(pheremone_array[i][1]/PHEREMONE_STRENGTH));
	  }
	}
  
	//process every food
	fill(160, 130, 90);
	stroke(130, 100, 60);
	
	for (let i = 0; i < food_array.length; i++) {
		if (food_array[i][1] == 0) {
			food_array.splice(i, 1); //should remove 1 element starting at i
		}
		else
		{
			circle(food_array[i][0].x, food_array[i][0].y, FOOD_DOT_SIZE*food_array[i][1]/FOOD_PER_DOT);
		}
	}
	
	//draw every obstacle
	fill(150);
	stroke(100);
	
	for (let i = 0; i < obstacle_array.length; i++) {
		circle(obstacle_array[i][0].x, obstacle_array[i][0].y, OBSTACLE_SIZE);
	}
	
	flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

/*
//add food to the food array
function mouseClicked() {
  food_array.push([createVector(mouseX, mouseY), FOOD_PER_DOT]);
}
*/

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0;
  this.maxspeed = 1.0;    // Maximum speed
  this.maxforce = 0.02; // Maximum steering force
  
  this.hasfood = false;
  this.tickstopheremone = PHEREMONE_RATE;
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  // this.borders();
  this.render();
  
  this.makePheremones();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  
  let avo = this.avoid(boids);      // Avoid Walls
  
  let foo = this.food(boids);       // Go Toward Food
  let hom = this.home(boids);       // Go Toward/Away From Home
  let phe = this.pheremones(boids); // Go Toward Pheremones
  let rep = this.repel(boids);
  // Arbitrarily weight these forces
  sep.mult(6.0);
  ali.mult(1.4);
  coh.mult(0.7);
  avo.mult(2.0);
  foo.mult(3.8);
  hom.mult(3.5);
  phe.mult(2.0);
  rep.mult(6.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(avo);
  this.applyForce(foo);
  this.applyForce(hom);
  this.applyForce(phe);
  this.applyForce(rep);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  if (this.hasfood)
  {
	fill(255, 255, 0);
	stroke(200, 200, 0);
  }
  else {
	fill(50);
	stroke(10);
  }
  
  let theta = this.velocity.heading() + radians(90);
  
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  //beginShape();
  //vertex(0, -this.r * 2);
  //vertex(-this.r, this.r * 2);
  //vertex(this.r, this.r * 2);
  //endShape(CLOSE);
  
  //head
  ellipse(0, -4, this.r*1, this.r*1.5);
  line(-0.5, -4, -3, -8);
  line(0.5, -4, 3, -8);
  
  //thorax
  ellipse(0, 0, this.r*1, this.r*2);
  line(-1, -1, -5, -4);
  line(1, -1, 5, -4);
  line(-1, 0, -6, 0)
  line(1, 0, 6, 0)
  line(-1, 1, -5, 4);
  line(1, 1, 5, 4);
  
  //abdomen
  ellipse(0, 5, this.r*1.5, this.r*2);
  
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width + this.r;
  if (this.position.y < -this.r)  this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  let desiredseparation = 15.0;
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
//if a boid is going in the opposite direction try to "reverse align"
Boid.prototype.align = function(boids) {
  let neighbordist = 90;
  let sum = createVector(0,0);
  let count = 0;
  
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position); //distance to other boid
    if ((d > 0) && (d < neighbordist)) {
		let a = this.velocity.angleBetween(boids[i].velocity); //angle between boid velocities
		if (a < PI*0.5) {
			let directionvector = createVector(this.position.x-boids[i].position.x, this.position.y-boids[i].position.y);
			let a2 = this.velocity.angleBetween(directionvector); //angle between boid and other boid?
			if (a2 > PI) {
				sum.add(boids[i].velocity);
				count++;
			}
		}
		else if (a > PI*1.5) {
			let directionvector = createVector(this.position.x-boids[i].position.x, this.position.y-boids[i].position.y);
			let a2 = this.velocity.angleBetween(directionvector); //angle between boid and other boid?
			if (a2 > PI) {
				sum.add(boids[i].velocity.mult(-1));
				count++;
			}
		}
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
// try to follow the boids in front of it going the say way
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  /*
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  */
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position); //distance to other boid
    if ((d > 0) && (d < neighbordist)) {
		let a = this.velocity.angleBetween(boids[i].velocity); //angle between boid velocities
		if (a < PI*0.25) {
			let directionvector = createVector(this.position.x-boids[i].position.x, this.position.y-boids[i].position.y);
			let a2 = this.velocity.angleBetween(directionvector);
			if (a2 < PI*0.1) {
				sum.add(boids[i].position);
				count++;
			}
		}
    }
  }
  if (count > 0) {
    sum.div(count);
	this.velocity.div(1.1); //slow down to let the other boid pass
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.avoid = function(boids) {
  let steer = createVector(0, 0);
  if (this.position.x <= 0) {
    steer.add(createVector(1, 0));
  }
  if (this.position.x > CANVAS_X) { // width of canvas
    steer.add(createVector(-1, 0));
  }
  if (this.position.y <= 0) {
    steer.add(createVector(0, 1));
  }
  if (this.position.y > CANVAS_Y) { // height of canvas
    steer.add(createVector(0, -1));
  }
  return steer;
}

Boid.prototype.repel = function(boids) {
	//let desiredseparation = OBSTACLE_SIZE;
	let steer = createVector(0, 0);
	let count = 0;
	// For every object in the system, check if it's too close
	for (let i = 0; i < obstacle_array.length; i++) {
		let d = p5.Vector.dist(this.position, obstacle_array[i][0]);
		// If the distance is greater than 0 and less than an arbitrary amount
		if ((d > 0) && (d < obstacle_array[i][1])) {
			// Calculate vector pointing away from obstacle
			let diff = p5.Vector.sub(this.position, obstacle_array[i][0]);
			diff.normalize();
			diff.div(d);        // Weight by distance
			steer.add(diff);
			count++;            // Keep track of how many
		}
	}
	// Average -- divide by how many
	if (count > 0) {
		steer.div(count);
	}

	// As long as the vector is greater than 0
	if (steer.mag() > 0) {
		// Implement Reynolds: Steering = Desired - Velocity
		steer.normalize();
		steer.mult(this.maxspeed);
		steer.sub(this.velocity);
		steer.limit(this.maxforce);
	}
	return steer;
}

Boid.prototype.food = function(boids) {
	//only go toward attractor if boid can smell it
	//if boid has no food, boid is attracted to food
	if (food_array.length > 0 && this.hasfood == false)
	{
		let fooddist = 50;
		let grabdist = 10;
		let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
		let count = 0;
		for (let i = 0; i < food_array.length; i++) {
			let d = p5.Vector.dist(this.position, food_array[i][0]);
			if ((d > 0) && (d < grabdist)) {
				this.hasfood = true;
				tickstopheremone = PHEREMONE_RATE; //reset pheremone rate
				food_array[i][1]--;
			}
			else if ((d > 0) && (d < fooddist)) {
				sum.add(food_array[i][0]); // Add location
				count++;
			}
		}
		if (count > 0) {
			sum.div(count);
			return this.seek(sum);  // Steer towards the location
		}
	}
	
	//in case nothing else is true
	return createVector(0, 0);
	
	//boid is always attracted to pheremone trail if it can't smell food or home
	//if boid can't smell anything, it should just amble about
}

Boid.prototype.makePheremones = function() {
	//if boid has food and can't smell another pheremone trail, make a new trail
	//if boid has food and can smell another pheremone trail, strengthen it
	
	let pheremonedist = 15;
	//console.log("makePheremones");
	
	//drop pheremones if none are nearby. otherwise strengthen an existing one
	if (this.hasfood) {
		if (this.tickstopheremone <= 0 && pheremone_array.length > 0) {
			let smallestdist = 100;
			let smallestdisti = -1;
			for (let i = 0; i < pheremone_array.length; i++) {
				let d = p5.Vector.dist(this.position, pheremone_array[i][0]);
				if (d < smallestdist) {
					smallestdist = d;
					smallestdisti = i;
				}
			}
			
			if (smallestdist < pheremonedist) {
				pheremone_array[smallestdisti][1] = PHEREMONE_STRENGTH;
				console.log("u done it");
			}
			else {
				pheremone_array.push([createVector(this.position.x, this.position.y), PHEREMONE_STRENGTH]);
			}
			this.tickstopheremone = PHEREMONE_RATE;
		}
		else if (this.tickstopheremone <= 0 && pheremone_array.length == 0) {
			pheremone_array.push([createVector(this.position.x, this.position.y), PHEREMONE_STRENGTH]);
			this.tickstopheremone = PHEREMONE_RATE;
		}
		else {
			this.tickstopheremone--;
		}
	}
}

Boid.prototype.home = function(boids) {
	//if boid has food, try to go home
	let homedist = Math.max(CANVAS_X, CANVAS_Y); //boid knows where home is, good boid
	let homevector = createVector(HOME_X, HOME_Y);
	
	if (this.hasfood) { //if boid has food, boid is attracted to home
		let dropdist = 25;
		
		let d = p5.Vector.dist(this.position, homevector);
		
		if ((d > 0) && (d < dropdist)) {
			this.hasfood = false;
		}
		else if ((d > 0) && (d < homedist)) {
			return this.seek(homevector);
		}
	}
	
	return createVector(0, 0);
}

Boid.prototype.pheremones = function(boids) {
	//boid is always attracted to pheremone trail
	
	if (pheremone_array.length > 0) {
		let pheremonedist = 50;
		let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
		let count = 0;
		for (let i = 0; i < pheremone_array.length; i++) {
			let d = p5.Vector.dist(this.position, pheremone_array[i][0]);
			//check distance
			if (d > 2 && d < pheremonedist) //don't go toward the pheremone you're on
			{
				let directionvector = createVector(this.position.x-pheremone_array[i][0].x, this.position.y-pheremone_array[i][0].y);
				let a = this.velocity.angleBetween(directionvector);
				if (a < PI) {
					sum.add(pheremone_array[i][0]); // Add location
					count++;
				}	
			}
		}
		if (count > 0) {
			//if a boid smells pheremones and has no food, it will go away from home
			steer = createVector(0,0);
			
			if (this.hasfood == false) {
				let homevector = createVector(HOME_X, HOME_Y);
			
				// Calculate vector pointing away from home
				let d = p5.Vector.dist(this.position, homevector);
				let diff = p5.Vector.sub(this.position, homevector);
				diff.normalize();
				diff.div(d);        // Weight by distance
				steer.add(diff);
			
				steer.normalize();
				steer.mult(this.maxspeed);
				steer.sub(this.velocity);
				steer.limit(this.maxforce);
			}		
			//steer.div(10); //make this weaker than desire to return home
			
			sum.div(count);
			return this.seek(sum).add(steer).div(2);  // Steer towards pheremone averaged with away from home
		}
	}
	return createVector(0, 0);
}