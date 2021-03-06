"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated data
const GPUBenchmark_1 = require("./__generated__/GPUBenchmark");
// Internal
const cleanEntryString_1 = require("./internal/cleanEntryString");
const cleanRendererString_1 = require("./internal/cleanRendererString");
const getBenchmarkByPercentage_1 = require("./internal/getBenchmarkByPercentage");
const getBrowserType_1 = require("./internal/getBrowserType");
const getEntryVersionNumber_1 = require("./internal/getEntryVersionNumber");
const getWebGLUnmaskedRenderer_1 = require("./internal/getWebGLUnmaskedRenderer");
const isWebGLSupported_1 = require("./internal/isWebGLSupported");
exports.getGPUTier = ({ mobileBenchmarkPercentages = [
    0,
    50,
    30,
    20,
], desktopBenchmarkPercentages = [
    0,
    50,
    30,
    20,
], forceRendererString = '', forceMobile = false, glContext, failIfMajorPerformanceCaveat = true, } = {}) => {
    let renderer;
    const isMobileTier = getBrowserType_1.isMobile || getBrowserType_1.isTablet || forceMobile;
    const createGPUTier = (index = 1, GPUType = 'FALLBACK') => ({
        tier: `GPU_${isMobileTier ? 'MOBILE' : 'DESKTOP'}_TIER_${index}`,
        type: GPUType,
    });
    if (forceRendererString) {
        renderer = forceRendererString;
    }
    else {
        const gl = glContext || isWebGLSupported_1.isWebGLSupported(getBrowserType_1.browser, failIfMajorPerformanceCaveat);
        if (!gl) {
            return createGPUTier(0, 'WEBGL_UNSUPPORTED');
        }
        renderer = getWebGLUnmaskedRenderer_1.getWebGLUnmaskedRenderer(gl);
    }
    renderer = cleanRendererString_1.cleanRendererString(renderer);
    // GPU BLACKLIST
    // https://wiki.mozilla.org/Blocklisting/Blocked_Graphics_Drivers
    // https://www.khronos.org/webgl/wiki/BlacklistsAndWhitelists
    // https://chromium.googlesource.com/chromium/src/+/master/gpu/config/software_rendering_list.json
    // https://chromium.googlesource.com/chromium/src/+/master/gpu/config/gpu_driver_bug_list.json
    const isGPUBlacklisted = /(radeon hd 6970m|radeon hd 6770m|radeon hd 6490m|radeon hd 6630m|radeon hd 6750m|radeon hd 5750|radeon hd 5670|radeon hd 4850|radeon hd 4870|radeon hd 4670|geforce 9400m|geforce 320m|geforce 330m|geforce gt 130|geforce gt 120|geforce gtx 285|geforce 8600|geforce 9600m|geforce 9400m|geforce 8800 gs|geforce 8800 gt|quadro fx 5|quadro fx 4|radeon hd 2600|radeon hd 2400|radeon hd 2600|mali-4|mali-3|mali-2)/.test(renderer);
    if (isGPUBlacklisted) {
        return createGPUTier(0, 'BLACKLISTED');
    }
    const [tier, type] = (isMobileTier ? getMobileRank : getDesktopRank)(getBenchmarkByPercentage_1.getBenchmarkByPercentage(isMobileTier ? GPUBenchmark_1.GPU_BENCHMARK_SCORE_MOBILE : GPUBenchmark_1.GPU_BENCHMARK_SCORE_DESKTOP, isMobileTier ? mobileBenchmarkPercentages : desktopBenchmarkPercentages), renderer, getEntryVersionNumber_1.getEntryVersionNumber(renderer));
    return createGPUTier(tier, type);
};
const getMobileRank = (benchmark, renderer, rendererVersionNumber) => {
    const type = [
        'adreno',
        'apple',
        'mali-t',
        'mali',
        'nvidia',
        'powervr',
    ].find((rendererType) => renderer.includes(rendererType));
    if (type) {
        for (let index = 0; index < benchmark.length; index++) {
            const benchmarkTier = benchmark[index];
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < benchmarkTier.length; i++) {
                const entry = cleanEntryString_1.cleanEntryString(benchmarkTier[i]);
                if (entry.includes(type) &&
                    (entry !== 'mali' || !entry.includes('mali-t')) &&
                    getEntryVersionNumber_1.getEntryVersionNumber(entry).includes(rendererVersionNumber)) {
                    return [index, `BENCHMARK - ${entry}`];
                }
            }
        }
    }
    // Handle mobile edge cases
    return [undefined, undefined];
};
const getDesktopRank = (benchmark, renderer, rendererVersionNumber) => {
    const type = ['intel', 'amd', 'nvidia'].find((rendererType) => renderer.includes(rendererType));
    if (type) {
        for (let index = 0; index < benchmark.length; index++) {
            const benchmarkTier = benchmark[index];
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < benchmarkTier.length; i++) {
                const entry = cleanEntryString_1.cleanEntryString(benchmarkTier[i]);
                if (entry.includes(type) && getEntryVersionNumber_1.getEntryVersionNumber(entry).includes(rendererVersionNumber)) {
                    return [index, `BENCHMARK - ${entry}`];
                }
            }
        }
    }
    // Handle desktop edge cases
    return [undefined, undefined];
};
//# sourceMappingURL=index.js.map