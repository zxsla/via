/**
 * 🌐 EcoHub 影视组件
 * 基于 eco.fe-spark.cn 聚合站 API
 */

var WidgetMetadata = {
    id: "ecohub.movie",
    title: "🌐 EcoHub影视",
    icon: "https://raw.githubusercontent.com/zxsla/via/main/widget-icon.jpg",
    description: "影视聚合：最新/恐怖/动作/奇幻/剧集/动漫，支持搜索与多源播放",
    author: "Eternity",
    site: "https://eco.fe-spark.cn",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    detailCacheDuration: 60,
    modules: [
        {
            id: "latest",
            title: "🆕 最新更新",
            description: "每日更新影视",
            functionName: "loadLatest",
            params: [
                { name: "page", title: "页码", type: "page", value: "1" },
                { name: "count", title: "数量", type: "count", value: "24" }
            ]
        },
        {
            id: "horror",
            title: "😱 恐怖电影",
            description: "恐怖片分类",
            functionName: "loadHorror",
            params: [
                { name: "page", title: "页码", type: "page", value: "1" },
                { name: "count", title: "数量", type: "count", value: "24" }
            ]
        },
        {
            id: "action",
            title: "💥 动作电影",
            description: "动作片分类",
            functionName: "loadAction",
            params: [
                { name: "page", title: "页码", type: "page", value: "1" },
                { name: "count", title: "数量", type: "count", value: "24" }
            ]
        },
        {
            id: "fantasy",
            title: "🔮 奇幻电影",
            description: "奇幻片分类",
            functionName: "loadFantasy",
            params: [
                { name: "page", title: "页码", type: "page", value: "1" },
                { name: "count", title: "数量", type: "count", value: "24" }
            ]
        },
        {
            id: "drama",
            title: "📺 电视剧",
            description: "热门剧集",
            functionName: "loadDrama",
            params: [
                { name: "page", title: "页码", type: "page", value: "1" },
                { name: "count", title: "数量", type: "count", value: "24" }
            ]
        },
        {
            id: "anime",
            title: "🎨 动漫",
            description: "动漫综合",
            functionName: "loadAnime",
            params: [
                { name: "page", title: "页码", type: "page", value: "1" },
                { name: "count", title: "数量", type: "count", value: "24" }
            ]
        },
        {
            id: "loadResource",
            title: "加载资源",
            functionName: "loadResource",
            type: "stream",
            params: []
        }
    ],
    search: {
        title: "搜索",
        functionName: "search",
        params: [
            { name: "keyword", title: "关键词", type: "input", value: "" },
            { name: "page", title: "页码", type: "page", value: "1" }
        ]
    }
};

var API = "https://eco.fe-spark.cn/api";
var UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function toItem(it) {
    var pic = it.picture || "";
    if (pic.indexOf("http://") === 0) pic = "https://" + pic.substring(7);
    var remarks = [];
    if (it.area) remarks.push(it.area);
    if (it.year && it.year !== "0" && it.year !== 0) remarks.push(it.year);
    return {
        id: String(it.id),
        type: "url",
        title: it.name || "",
        coverUrl: pic,
        posterPath: pic,
        description: it.blurb || it.subTitle || "",
        mediaType: "movie",
        rating: it.score ? String(it.score) : "",
        genreTitle: it.cName || "",
        link: "ecohub:" + it.id
    };
}

async function apiGet(path) {
    var res = await Widget.http.get(API + path, {
        headers: { "User-Agent": UA, "Referer": "https://eco.fe-spark.cn/" }
    });
    return res.data;
}

async function loadLatest(params) {
    params = params || {};
    var page = Number(params.page || 1);
    var count = Number(params.count || 24);
    var d = await apiGet("/dailyUpdates");
    var list = (d.data && d.data.list) || [];
    var start = (page - 1) * count;
    return list.slice(start, start + count).map(toItem);
}

async function loadClassify(cls, params) {
    params = params || {};
    var page = Number(params.page || 1);
    var count = Number(params.count || 24);
    var d = await apiGet("/filmClassifySearch?Pid=9&class=" + encodeURIComponent(cls) + "&page=" + page);
    var list = (d.data && d.data.list) || [];
    return list.slice(0, count).map(toItem);
}

async function loadHorror(params) { return loadClassify("恐怖", params); }
async function loadAction(params) { return loadClassify("动作", params); }
async function loadFantasy(params) { return loadClassify("奇幻", params); }

async function loadPid(pid, params) {
    params = params || {};
    var page = Number(params.page || 1);
    var count = Number(params.count || 24);
    var d = await apiGet("/filmClassifySearch?Pid=" + pid + "&page=" + page);
    var list = (d.data && d.data.list) || [];
    return list.slice(0, count).map(toItem);
}

async function loadDrama(params) { return loadPid(1, params); }
async function loadAnime(params) { return loadPid(20, params); }

async function search(params) {
    params = params || {};
    var kw = params.keyword || "";
    var page = Number(params.page || 1);
    if (!kw) throw new Error("请输入关键词");
    var d = await apiGet("/searchFilm?keyword=" + encodeURIComponent(kw) + "&current=" + page + "&pageSize=24");
    var list = (d.data && d.data.list) || [];
    return list.map(toItem);
}

async function loadDetail(link) {
    if (!link || link.indexOf("ecohub:") !== 0) return null;
    var vid = link.substring(7);
    var d = await apiGet("/filmPlayInfo?id=" + vid);
    var det = (d.data && d.data.detail) || {};
    if (!det.id && !det.name) return null;
    var pic = det.picture || "";
    if (pic.indexOf("http://") === 0) pic = "https://" + pic.substring(7);
    return {
        id: String(det.id || vid),
        type: "url",
        title: det.name || "",
        coverUrl: pic,
        posterPath: pic,
        description: det.blurb || "",
        releaseDate: String(det.year || ""),
        mediaType: "movie",
        rating: det.score ? String(det.score) : "",
        link: link
    };
}

async function loadResource(params) {
    params = params || {};
    var link = params.link || "";
    if (link.indexOf("ecohub:") !== 0) return [];
    var vid = link.substring(7);
    var d = await apiGet("/filmPlayInfo?id=" + vid);
    var det = (d.data && d.data.detail) || {};
    var resources = [];
    var list = det.list || [];
    for (var i = 0; i < list.length; i++) {
        var src = list[i];
        var linkList = src.linkList || [];
        if (linkList.length === 0) continue;
        // 取第一集的播放地址
        var ep0 = linkList[0];
        var url = ep0.link || "";
        if (url.indexOf("//") === 0) url = "https:" + url;
        else if (url.indexOf("http://") === 0) url = "https://" + url.substring(7);
        if (!url) continue;
        resources.push({
            name: src.name || ("线路" + (i + 1)),
            description: linkList.length + "集",
            url: url,
            customHeaders: {
                "User-Agent": UA,
                "Referer": "https://eco.fe-spark.cn/"
            }
        });
    }
    return resources;
}
