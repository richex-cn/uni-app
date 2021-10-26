'use strict';

var uniCliShared = require('@dcloudio/uni-cli-shared');
var initMiniProgramPlugin = require('@dcloudio/uni-mp-vite');
var path = require('path');
var fs = require('fs-extra');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var initMiniProgramPlugin__default = /*#__PURE__*/_interopDefaultLegacy(initMiniProgramPlugin);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

var description = "项目配置文件。";
var packOptions = {
	ignore: [
	]
};
var setting = {
	urlCheck: true,
	es6: true,
	postcss: false,
	minified: false,
	newFeature: true,
	nodeModules: false
};
var compileType = "miniprogram";
var libVersion = "";
var appid = "touristappid";
var projectname = "";
var condition = {
	search: {
		current: -1,
		list: [
		]
	},
	conversation: {
		current: -1,
		list: [
		]
	},
	game: {
		current: -1,
		list: [
		]
	},
	miniprogram: {
		current: -1,
		list: [
		]
	}
};
var source = {
	description: description,
	packOptions: packOptions,
	setting: setting,
	compileType: compileType,
	libVersion: libVersion,
	appid: appid,
	projectname: projectname,
	condition: condition
};

let isFixed = false;
function fix2648(bundle) {
    if (isFixed) {
        return;
    }
    const appJsonAsset = bundle['app.json'];
    if (!appJsonAsset) {
        return;
    }
    try {
        const { usingComponents } = JSON.parse(appJsonAsset.source.toString());
        if (usingComponents && !Object.keys(usingComponents).length) {
            fs__default["default"].outputFileSync(path__default["default"].resolve(process.env.UNI_OUTPUT_DIR, 'fix-2648.json'), `{"component":true}`);
            fs__default["default"].outputFileSync(path__default["default"].resolve(process.env.UNI_OUTPUT_DIR, 'fix-2648.qml'), `<!-- https://github.com/dcloudio/uni-app/issues/2648 -->`);
            fs__default["default"].outputFileSync(path__default["default"].resolve(process.env.UNI_OUTPUT_DIR, 'fix-2648.js'), `Component({})`);
        }
        isFixed = true;
    }
    catch (_a) { }
}

const uniMiniProgramWeixinPlugin = {
    name: 'vite:uni-mp-qq',
    config() {
        return {
            define: {
                __VUE_CREATED_DEFERRED__: false,
            },
        };
    },
    writeBundle(_, bundle) {
        fix2648(bundle);
    },
};
const options = {
    vite: {
        inject: {
            uni: [
                uniCliShared.resolveBuiltIn('@dcloudio/uni-mp-qq/dist/uni.api.esm.js'),
                'default',
            ],
        },
        alias: {
            'uni-mp-runtime': uniCliShared.resolveBuiltIn('@dcloudio/uni-mp-qq/dist/uni.mp.esm.js'),
        },
        copyOptions: {
            assets: ['wxcomponents'],
            targets: [
                {
                    src: ['custom-tab-bar'],
                    get dest() {
                        return process.env.UNI_OUTPUT_DIR;
                    },
                },
            ],
        },
    },
    global: 'qq',
    app: {
        darkmode: true,
        subpackages: true,
    },
    project: {
        filename: 'project.config.json',
        source,
    },
    template: {
        filter: {
            extname: '.qs',
            lang: 'wxs',
            generate(filter, filename) {
                if (filename) {
                    return `<qs src="${filename}.qs" module="${filter.name}"/>`;
                }
                return `<qs module="${filter.name}">
${filter.code}
</qs>`;
            },
        },
        slot: {
            fallback: false,
        },
        extname: '.qml',
        directive: 'qq:',
        compilerOptions: {
            nodeTransforms: [uniCliShared.addComponentBindLink],
        },
    },
    style: {
        extname: '.qss',
    },
};
var index = [uniMiniProgramWeixinPlugin, ...initMiniProgramPlugin__default["default"](options)];

module.exports = index;