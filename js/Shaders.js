/**
 * Sebastian Fojcik
 */

const vertexShaderSource = `
precision mediump float;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

attribute vec3 vertPosition;
attribute vec3 vertNorm;
varying vec3 fragPos;
varying vec3 fragNorm;
varying float distToCamera;
varying float value;

void main() {
    vec4 worldPosition = vec4( mWorld * vec4(vertPosition, 1.0) );
    vec4 viewWorldPosition =  mView * worldPosition;
    gl_Position = mProjection * viewWorldPosition;
    gl_PointSize = 1.0;
    
    // varying
    fragPos = vec3(worldPosition);
    fragNorm = vertNorm;
    distToCamera = -viewWorldPosition.z;
    value = vertPosition.y;
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec3 fragPos;
varying vec3 fragNorm;
varying float distToCamera;
varying float value;

uniform vec3 fragColor;
uniform vec3 backgroundColor;
uniform bool isFog;
uniform bool isThermal;
uniform bool isLighting;

uniform vec3 lightColor;
uniform vec3 lightPos;
uniform float ambientStrength;

vec3 red = vec3(1.0, 0.0, 0.0);
vec3 green = vec3(0.0, 1.0, 0.0);
vec3 blue = vec3(0.0, 0.0, 1.0);
vec3 yellow = vec3(1.0, 1.0, 0.0);
vec3 cyan = vec3(0.0, 1.0, 1.0);

void main() {
    vec3 color = fragColor;
    
    // Mapa cieplna
    if( isThermal ) {
        float thermalFactor = min(abs(value), 1.0);
        if(value > 0.0) {
            if(value > 0.5)
                color = mix(yellow, red, (thermalFactor-0.5)*2.0);
            else
                color = mix(green, yellow, thermalFactor*2.0);
        } else {
            if(value < -0.5)
                color = mix(cyan, blue, (thermalFactor-0.5)*2.0);
            else
                color = mix(green, cyan, thermalFactor*2.0);
        }
    }
    
    // Światło
    if( isLighting ) {
        vec3 ambient = ambientStrength * lightColor;
        
        vec3 norm = normalize(fragNorm);
        vec3 lightDir = normalize(lightPos - fragPos);
        
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * lightColor;
        color = (ambient + diffuse) * color;
    }
    
    // Mgła
    if( isFog ) {
        float distToCameraFactor = min(distToCamera / 5.0, 1.0);
        color = mix(color, backgroundColor, distToCameraFactor);
    } 
    
    gl_FragColor = vec4(color, 1.0);
}
`;