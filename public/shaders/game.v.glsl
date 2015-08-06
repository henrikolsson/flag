attribute vec4 vert;
//attribute vec3 color;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying float inColor;

void main(void) {
    inColor = vert.w;
    gl_Position = projection * view * model * vec4(vert.xyz, 1);
}
