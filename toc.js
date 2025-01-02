// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="0.0导语——为什么需要python逆向.html"><strong aria-hidden="true">1.</strong> 导语——为什么要进行python逆向</a></li><li class="chapter-item expanded "><a href="1.0python基础.html"><strong aria-hidden="true">2.</strong> python基础</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="1.1认识python生成的文件.html"><strong aria-hidden="true">2.1.</strong> 认识python生成的文件</a></li><li class="chapter-item expanded "><a href="1.2python的魔术方法.html"><strong aria-hidden="true">2.2.</strong> python的魔术方法🚧</a></li><li class="chapter-item expanded "><a href="1.3pvm字节码.html"><strong aria-hidden="true">2.3.</strong> pvm字节码</a></li></ol></li><li class="chapter-item expanded "><a href="2.0Python和C对接的类型.html"><strong aria-hidden="true">3.</strong> python和C的对接类型</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="2.1PyTypeObject.html"><strong aria-hidden="true">3.1.</strong> PyTypeObject</a></li><li class="chapter-item expanded "><a href="2.2PyObject.html"><strong aria-hidden="true">3.2.</strong> PyObject</a></li><li class="chapter-item expanded "><a href="2.3PyCodeObject.html"><strong aria-hidden="true">3.3.</strong> PyCodeObject</a></li><li class="chapter-item expanded "><a href="2.4类型和底层结构的关系.html"><strong aria-hidden="true">3.4.</strong> 类型和底层结构的关系</a></li><li class="chapter-item expanded "><a href="2.5python基础类型的结构体以及转化方法.html"><strong aria-hidden="true">3.5.</strong> python基础类型的结构体以及转化方法</a></li></ol></li><li class="chapter-item expanded "><a href="3.0开始逆向实战.html"><strong aria-hidden="true">4.</strong> 开始逆向实战</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="3.1pyd_so逆向——变量.html"><strong aria-hidden="true">4.1.</strong> pyd/so逆向——变量</a></li><li class="chapter-item expanded "><a href="3.2pyd_so逆向——函数.html"><strong aria-hidden="true">4.2.</strong> pyd/so逆向——函数🚧</a></li><li class="chapter-item expanded "><a href="3.3pyd_so逆向——方法.html"><strong aria-hidden="true">4.3.</strong> pyd/so逆向——方法🚧</a></li><li class="chapter-item expanded "><a href="3.4pyd_so逆向——循环.html"><strong aria-hidden="true">4.4.</strong> pyd/so逆向——循环🚧</a></li><li class="chapter-item expanded "><a href="3.5pyd_so逆向——分支.html"><strong aria-hidden="true">4.5.</strong> pyd/so逆向——分支🚧</a></li><li class="chapter-item expanded "><a href="3.6pyc逆向——工具逆向.html"><strong aria-hidden="true">4.6.</strong> pyc逆向——使用工具逆向</a></li><li class="chapter-item expanded "><a href="3.7py_exe逆向——工具逆向.html"><strong aria-hidden="true">4.7.</strong> py_exe逆向——使用工具逆向🚧</a></li></ol></li><li class="chapter-item expanded "><a href="附件1：魔数对照表.html"><strong aria-hidden="true">5.</strong> 附件1:魔术对照表</a></li><li class="chapter-item expanded "><a href="附件2：python安装配置表.html"><strong aria-hidden="true">6.</strong> 附件2:python安装配置表</a></li><li class="chapter-item expanded "><a href="附件3：/附件3：python逆向ida文件.html"><strong aria-hidden="true">7.</strong> 附件3:python插件、脚本等</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
