/**
 * Training AI Foundry - 交互逻辑
 */

// 进入工作台
function enterWorkspace(pageId = 'dashboard') {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('workspace').style.display = 'block';
    showPage(pageId);
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 返回首页
function goToLanding() {
    document.getElementById('workspace').style.display = 'none';
    document.getElementById('landing-page').style.display = 'block';
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 滚动到指定区域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// 页面切换
function showPage(pageId) {
    // 页面名称映射
    const pageNames = {
        'dashboard': '工作台',
        'ai-catalog': 'AI能力地图',
        'courses': '课程中心',
        'cases': '实践案例',
        'knowledge': '知识库',
        'smart-query': '智能问数',
        'agents': '智能体管理',
        'workflow': '工作流编排',
        'mcp-service': 'MCP服务管理',
        'models': '模型管理',
        'api-manage': 'API管理',
        'skills-repo': 'Skills仓库'
    };

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageId) {
            item.classList.add('active');
        }
    });

    // 更新面包屑
    const breadcrumbCurrent = document.querySelector('.breadcrumb .current');
    if (breadcrumbCurrent && pageNames[pageId]) {
        breadcrumbCurrent.textContent = pageNames[pageId];
    }
}

// 弹窗控制
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 初始化导航点击事件
document.addEventListener('DOMContentLoaded', () => {
    // 导航项点击
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.dataset.page;
            if (pageId) {
                showPage(pageId);
            }
        });
    });

    // 筛选标签点击
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 获取筛选类别
            const category = tab.dataset.category;
            const cards = document.querySelectorAll('.catalog-card');

            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 视图切换按钮点击
    document.querySelectorAll('.view-toggle').forEach(toggle => {
        toggle.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // 更新按钮状态
                toggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 获取视图类型和对应的grid容器
                const viewType = btn.dataset.view;
                const page = toggle.closest('.page');
                if (page) {
                    // 查找页面中的grid容器
                    const gridContainers = page.querySelectorAll('.catalog-grid, .agents-grid, .course-grid, .cases-list, .services-grid, .models-grid, .api-grid, .skills-grid');
                    gridContainers.forEach(container => {
                        if (viewType === 'list') {
                            container.classList.add('list-view');
                            container.classList.remove('grid-view');
                        } else {
                            container.classList.remove('list-view');
                            container.classList.add('grid-view');
                        }
                    });
                }
            });
        });
    });

    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });

    // 搜索框交互
    const searchInput = document.querySelector('.search-input');
    const searchWrapper = document.querySelector('.search-wrapper');
    if (searchInput && searchWrapper) {
        searchInput.addEventListener('focus', () => {
            searchWrapper.style.width = '360px';
        });
        searchInput.addEventListener('blur', () => {
            searchWrapper.style.width = '320px';
        });
    }

    // 首页导航滚动效果
    const landingNav = document.querySelector('.landing-nav');
    if (landingNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                landingNav.style.background = 'rgba(255, 255, 255, 0.95)';
                landingNav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
            } else {
                landingNav.style.background = 'rgba(255, 255, 255, 0.8)';
                landingNav.style.boxShadow = 'none';
            }
        });
    }

    // 模拟数据加载动画
    animateStats();
});

// 统计数字动画
function animateStats() {
    document.querySelectorAll('.stat-value').forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 30);
    });
}

// 工具提示
function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #232323;
        border: 1px solid #2E2E2E;
        color: #EDEDED;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.top = rect.top - 40 + 'px';
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.transform = 'translateX(-50%)';

    document.body.appendChild(tooltip);

    setTimeout(() => tooltip.remove(), 2000);
}

// 通知提示
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="notification-text">${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #232323;
        border: 1px solid #2E2E2E;
        border-radius: 8px;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #EDEDED;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
