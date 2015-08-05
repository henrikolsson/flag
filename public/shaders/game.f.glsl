precision mediump float;
varying vec3 fColor;

void main(void) {
    gl_FragColor = vec4(fColor.x,
                        fColor.y,
                        fColor.z,
                        1.0);
    /* gl_FragColor = vec4(clamp(color.w / 16.0, 0.2, 1.0), */
    /*                     clamp(color.w / 16.0, 0.2, 1.0), */
    /*                     clamp(color.w / 16.0, 0.2, 1.0), */
    /*                     1.0); */
    //    gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
}
