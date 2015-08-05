attribute vec3 vert;
attribute vec3 color;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec3 fColor;

void main(void) {
    fColor = color;
    gl_Position = projection * view * model * vec4(vert.xyz, 1);
}
