class Velocity {
    private vx: number;
    private vy: number;

    constructor(x: number, y: number) {
        this.vx = x;
        this.vy = y;
    }

    public InvertVx() {
        this.vx = -this.vx;
    }

    public InvertVy() {
        this.vy = -this.vy;
    }

    public get VX(): number {
        return this.vx;
    }

    public get VY(): number {
        return this.vy;
    }

    public AddToVX(num: number) {
        this.vx += num;
    }

    public AddToVY(num: number) {
        this.vy += num;
    }

    public SubFromVX(num: number) {
        this.AddToVX(-num);
    }

    public SubFromVY(num: number) {
        this.AddToVY(-num);
    }

}

class Postition {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public DistanceFrom(other_pos: Postition) {
        return Math.sqrt(Math.pow(this.X - other_pos.X, 2) + Math.pow(this.Y - other_pos.Y, 2))
    }

    public get X(): number {
        return this.x;
    }

    public get Y(): number {
        return this.y;
    }

    public AddToX(num: number) {
        this.x += num;
    }

    public AddToY(num: number) {
        this.y += num;
    }

    public SubFromX(num: number) {
        this.AddToX(-num);
    }

    public SubFromY(num: number) {
        this.AddToY(-num);
    }
    public isEquals(position: Postition) {
        return (this.X == position.X) && (this.Y == position.Y);
    }

}

class Body {
    private position: Postition;
    private velocity: Velocity;
    private mass: number;
    private color: Color;

    constructor(x: number, y: number, vx: number, vy: number, mass: number, color: Color) {
        this.position = new Postition(x, y);
        this.velocity = new Velocity(vx, vy);
        this.mass = mass;
        this.color = color;
    }
    public get Mass() {
        return this.mass;
    }
    public set Mass(value: number) {
        this.mass = value;
    }
    public get Color() {
        return this.color;
    }
    public set Color(value: Color) {
        this.color = value;
    }
    public get Position() {
        return this.position;
    }
    public get Velocity() {
        return this.velocity;
    }
    OffsetVelocity(dvx: number, dvy: number) {
        this.velocity.AddToVX(dvx);
        this.velocity.AddToVY(dvy);
    }
    OffsetPosition(dx: number, dy: number) {
        this.position.AddToX(dx);
        this.position.AddToY(dy);
    }
}

class Color {
    private red: number;
    public get Red(): number {
        return this.red;
    }
    public set Red(value: number) {

        this.red = value % 256;

    }
    private green: number;
    public get Green(): number {
        return this.green;
    }
    public set Green(value: number) {

        this.green = value % 256;

    }
    private blue: number;
    public get Blue(): number {
        return this.blue;
    }
    public set Blue(value: number) {

        this.blue = value % 256;
    }
    private alpha: number;
    public get Alpha(): number {
        return this.alpha;
    }
    public set Alpha(value: number) {
        this.alpha = value;
    }


    static GenerateRandomColor(): Color {
        return new Color(GenerateRandomNumber(0, 255), GenerateRandomNumber(0, 255), GenerateRandomNumber(0, 255))
    }

    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = 1.0;
    }
}
const G: number = 6.673e-11;
const base_mass = 100000;
const default_mass = 5 * base_mass;
const min_mass: number = 1 * base_mass;
const max_mass: number = 10 * base_mass;
const black_hole_mass = 20 * base_mass;
const trails_input = <HTMLInputElement>document.getElementById("enable_trails");
const auto_reset_input = <HTMLInputElement>document.getElementById("auto_reset");
const body_size_input = <HTMLInputElement>document.getElementById("body_size");
const time_flow_input = <HTMLInputElement>document.getElementById("time_flow");
const body_number_input = <HTMLInputElement>document.getElementById("body_number");
const random_mass_input = <HTMLInputElement>document.getElementById("random_mass");

let body_size = 2;
let time_flow = 1;
let draw_trails: boolean = trails_input.checked;
let auto_reset: boolean = auto_reset_input.checked;
let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas_id");
canvas.width = screen.width;
canvas.height = screen.height;
let canvasWidth: number = canvas.width;
let canvasHeight: number = canvas.height;
let ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d");
let body_array: Body[] = [];
let out_of_bounds_counter = 0;
main();

async function main() {
    ResetEverything();

    while (true) {
        for (let i = 0; i < body_array.length; i++) {
            for (let j = i + 1; j < body_array.length; j++) {
                CalculateForce(body_array[i], body_array[j]);
            }
        }

        if (!draw_trails) {
            ClearCanvas();
        }

        UpdateBodies();
        DrawBodies();

        out_of_bounds_counter = 0;
        await sleep(time_flow);
    }
}

function TrailsChange() {
    draw_trails = trails_input.checked;
}

function AutoResetChange() {
    auto_reset = auto_reset_input.checked;
}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function ResetCanvas() {
    body_array = [];
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function SizeChange() {
    body_size = Number.parseInt(body_size_input.value);
}

function TimeChange() {
    time_flow = Number.parseInt(time_flow_input.value);
}

function InputChanged() {
    ResetCanvas()
    for (let index = 0; index < Number.parseInt(body_number_input.value); index++) {
        let x: number = GenerateRandomNumber(0, canvasWidth);
        let vx: number = Math.random() * Math.floor(Math.random() * (3)) - 1;
        let y: number = GenerateRandomNumber(0, canvasHeight);
        let vy: number = Math.random() * Math.floor(Math.random() * (3)) - 1;
        let color: Color = Color.GenerateRandomColor();
        let mass: number = default_mass;
        if (random_mass_input.checked) {
            mass = GenerateRandomNumber(min_mass, max_mass);
            if (color.Red == 255 && color.Green == 255 && color.Blue == 255) {
                mass = black_hole_mass;
            }
        }
        body_array.push(new Body(x, y, vx, vy, mass, color))
    }
    DrawBodies();
}

function ResetEverything(){
    InputChanged();
}

function GenerateRandomNumber(min: number, max: number): number {
    if (max >= min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        throw new RangeError("ERROR! Minimum number must be smaller or equal to maximum number!");
    }
}

function DrawPixel(position: Postition, width: number, height: number, color: Color) {
    if (ctx != null) {
        if (position.X >= 0 && position.X <= canvasWidth && position.Y >= 0 && position.Y <= canvasHeight) {
            ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
            ctx.fillRect(position.X, position.Y, width, height);
        } else {
            out_of_bounds_counter++;
            if (out_of_bounds_counter == body_array.length){
                ResetEverything();
            }
        }

    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function DrawBodies() {
    body_array.forEach(body => {
        DrawPixel(body.Position, body_size, body_size, body.Color)
    });
}

function CalculateForce(body1: Body, body2: Body) {
    if (!body1.Position.isEquals(body2.Position)) {
        let distance: number = body1.Position.DistanceFrom(body2.Position);

        let force: number = (G * body1.Mass * body2.Mass * distance) / Math.pow(Math.abs(distance), 3);

        let delta_x = (body2.Position.X - body1.Position.X) * force;
        let delta_y = (body2.Position.Y - body1.Position.Y) * force;
        body1.Velocity.AddToVX(delta_x);
        body1.Velocity.AddToVY(delta_y);
        body2.Velocity.AddToVX(-delta_x);
        body2.Velocity.AddToVY(-delta_y);
    }
}

function UpdateBodies() {
    body_array.forEach(body => {
        body.Position.AddToX(body.Velocity.VX);
        body.Position.AddToY(body.Velocity.VY);
    });
}

function Reset() {
    ResetEverything();
}

window.onresize = () => {
    canvas.width = screen.width;
    canvas.height = screen.height;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}