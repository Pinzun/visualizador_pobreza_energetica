// src/components/TabSelector.tsx
import "../styles/TabSelector.css";

type TabItem = { key: string; label: string };

type TabSelectorProps = {
  tabs: TabItem[];
  currentTab: string;
  onTabChange: (key: string) => void;
};

function TabSelector({ tabs, currentTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Selector de pestañas">
      {tabs.map((t) => {
        const isActive = t.key === currentTab;
        return (
          <button
            key={t.key}
            type="button"
            className={`tab-btn ${
              isActive ? "tab-btn--active" : "tab-btn--inactive"
            }`}
            onClick={() => onTabChange(t.key)}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default TabSelector;
