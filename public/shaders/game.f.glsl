precision mediump float;
varying float inColor;

void main(void) {
    gl_FragColor = vec4(clamp(inColor / 5.0, 0.2, 1.0),
                        clamp(inColor / 5.0, 0.2, 1.0),
                        clamp(inColor / 5.0, 0.2, 1.0),
                        1.0);
}
