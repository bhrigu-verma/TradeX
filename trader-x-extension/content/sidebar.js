// ============================================================================
// TRADERX SIDEBAR - FINTECH EDITION
// ============================================================================
// Professional grade UI with Slate-950 theme
// Includes Trusted Mode toggle and Advanced Search integration
// ============================================================================

class TraderXSidebar {
    constructor() {
        this.isVisible = false;
        this.trustedMode = localStorage.getItem('traderx_trusted_mode') === 'true';
        this.createSidebar();
        this.injectStyles();
    }

    // ========================================================================
    // STYLES
    // ========================================================================
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
      #traderx-sidebar {
        position: fixed;
        top: 0;
        right: -320px;
        width: 320px;
        height: 100vh;
        background: #0B1120; /* Slate 950 */
        border-left: 1px solid #1E293B; /* Slate 800 */
        z-index: 9999;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        color: #F8FAFC; /* Slate 50 */
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Roboto", sans-serif;
        box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      }
      
      #traderx-sidebar.visible {
        right: 0;
      }
      
      .tx-header {
        padding: 20px 24px;
        border-bottom: 1px solid #1E293B;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #0F172A; /* Slate 900 */
      }
      
      .tx-title {
        font-size: 18px;
        font-weight: 700;
        color: #F8FAFC;
        display: flex;
        align-items: center;
        gap: 10px;
        letter-spacing: -0.02em;
      }
      
      .tx-close {
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tx-close:hover {
        background: #1E293B;
        color: #F8FAFC;
      }
      
      /* Toggle Section */
      .tx-section {
        padding: 24px;
        border-bottom: 1px solid #1E293B;
      }
      
      .tx-section-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748B; /* Slate 500 */
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tx-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #1E293B;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid #334155;
      }
      
      .tx-toggle-label {
        font-size: 14px;
        font-weight: 500;
        color: #E2E8F0;
      }
      
      .tx-toggle-sub {
        font-size: 12px;
        color: #94A3B8;
        margin-top: 2px;
      }
      
      /* Toggle Switch */
      .tx-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      
      .tx-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .tx-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #334155;
        transition: .3s;
        border-radius: 34px;
      }
      
      .tx-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      input:checked + .tx-slider {
        background-color: #3B82F6; /* Blue 500 */
      }
      
      input:checked + .tx-slider:before {
        transform: translateX(20px);
      }
      
      /* Controls / Buttons */
      .tx-controls {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .tx-btn {
        width: 100%;
        padding: 14px;
        border-radius: 8px;
        border: 1px solid #334155;
        background: #1E293B;
        color: #E2E8F0;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .tx-btn:hover {
        background: #334155;
        border-color: #475569;
      }
      
      .tx-btn-primary {
        background: #3B82F6;
        border-color: #2563EB;
        color: white;
      }
      
      .tx-btn-primary:hover {
        background: #2563EB;
      }
      
      /* Footer */
      .tx-footer {
        margin-top: auto;
        padding: 24px;
        border-top: 1px solid #1E293B;
        text-align: center;
      }
      
      .tx-credits {
        font-size: 11px;
        color: #64748B;
        font-weight: 500;
      }
      
      .tx-link {
        color: #94A3B8;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .tx-link:hover {
        color: #3B82F6;
        text-decoration: underline;
      }
      
      /* Floating Trigger */
      #tx-trigger {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #3B82F6;
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        cursor: pointer;
        z-index: 9990;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background 0.2s;
      }
      
      #tx-trigger:hover {
        transform: translateY(-2px);
        background: #2563EB;
      }
    `;
        document.head.appendChild(style);
    }

    // ========================================================================
    // COMPONENT
    // ========================================================================
    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.id = 'traderx-sidebar';

        sidebar.innerHTML = `
      <div class="tx-header">
        <div class="tx-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          TraderX Pro
        </div>
        <button class="tx-close" id="tx-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="tx-section">
        <div class="tx-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Core Filters
        </div>
        <div class="tx-toggle-row">
          <div>
            <div class="tx-toggle-label">Trusted View Only</div>
            <div class="tx-toggle-sub">Verified accounts only</div>
          </div>
          <label class="tx-switch">
            <input type="checkbox" id="tx-trusted-toggle" ${this.trustedMode ? 'checked' : ''}>
            <span class="tx-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="tx-controls">
        <div class="tx-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Market Research
        </div>
        
        <button class="tx-btn tx-btn-primary" id="tx-adv-search">
          Advanced Search
        </button>
        
        <button class="tx-btn" id="tx-directory-open">
          View Signal Directory
        </button>

        <button class="tx-btn" id="tx-tracker-toggle">
          Toggle Live Tracker
        </button>
      </div>
      
      <div class="tx-footer">
        <div class="tx-credits">
          Engineered by <a href="https://github.com/bhrigu-verma" target="_blank" class="tx-link">Bhrigu Verma</a>
        </div>
      </div>
    `;

        document.body.appendChild(sidebar);

        // Add floating trigger button
        const trigger = document.createElement('button');
        trigger.id = 'tx-trigger';
        trigger.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
      </svg>
    `;
        trigger.addEventListener('click', () => this.toggle());
        document.body.appendChild(trigger);

        this.setupListeners();
    }

    setupListeners() {
        // Close button
        document.getElementById('tx-close-btn').addEventListener('click', () => this.close());

        // Trusted Toggle
        document.getElementById('tx-trusted-toggle').addEventListener('change', (e) => {
            this.trustedMode = e.target.checked;
            window.traderXToggleTrustedMode(this.trustedMode);
        });

        // Advanced Search
        document.getElementById('tx-adv-search').addEventListener('click', () => {
            if (window.traderXSearch) {
                window.traderXSearch.createSearchUI();
                this.close();
            }
        });

        // Directory
        document.getElementById('tx-directory-open').addEventListener('click', () => {
            if (window.TraderXDirectory) {
                window.TraderXDirectory.show();
                this.close();
            }
        });

        // Tracker Toggle
        document.getElementById('tx-tracker-toggle').addEventListener('click', () => {
            if (window.TraderXTrackerDashboard) {
                window.TraderXTrackerDashboard.toggle();
            }
        });
    }

    toggle() {
        const sidebar = document.getElementById('traderx-sidebar');
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            sidebar.classList.add('visible');
        } else {
            sidebar.classList.remove('visible');
        }
    }

    close() {
        this.isVisible = false;
        document.getElementById('traderx-sidebar').classList.remove('visible');
    }
}

// Init
window.addEventListener('load', () => {
    window.TraderXSidebar = new TraderXSidebar();
});
