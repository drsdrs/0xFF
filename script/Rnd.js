let seed = 0xACE1;
let state1 = seed;
let state2 = seed+1;
let state3 = seed+2;

// Generate the next random number
function next() {
    state1 >>= 1;
    if (state1&1) { state1 ^= 0xD0000001; }
    state2 >>= 1;
    if (state2&1) { state2 ^= 0x80000003; }
    state3 >>= 1;
    if (state3&1) { state3 ^= 0x40000001; }
    return .5+((state1 ^ state2 ^ state3) / 0xFFFFFFFF); // Normalize to [0, 1)
}

function setSeed(seedNew) {
    seed = seedNew;
    state1 = seedNew;
    state2 = seedNew + 1;
    state3 = seedNew + 2;
}

let LFSR = {
    init: function () { },
    seed: setSeed,
    next: next,
}

export default LFSR
