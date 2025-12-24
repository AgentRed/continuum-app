import React from "react";
import { Group, Text } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { topNavItems, matchesRoute, type TopNavItem } from "../navigation/navConfig";
import { IconBooks, IconCpu, IconInfoCircle, IconBook2 } from "@tabler/icons-react";

type PaletteDef = {
  background: string;
  surface: string;
  header: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSoft: string;
  border: string;
};

interface TopNavProps {
  palette: PaletteDef;
}

const TopNav: React.FC<TopNavProps> = ({ palette }) => {
  const location = useLocation();

  const isActive = (item: TopNavItem): boolean => {
    return matchesRoute(location.pathname, item.matchers);
  };

  // Icon mapping for top nav items
  const getIcon = (label: string) => {
    switch (label) {
      case "Library":
        return IconBooks;
      case "System":
        return IconCpu;
      case "About":
        return IconInfoCircle;
      case "Glossary":
        return IconBook2;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingLeft: "calc(260px + 16px)", // Sidebar width (260px) + AppShell padding (16px)
        paddingRight: "16px",
        maxWidth: "100%",
      }}
    >
      <Group gap="lg">
        {topNavItems.map((item) => {
          const active = isActive(item);
          const Icon = getIcon(item.label);
          return (
            <Text
              key={item.path}
              component={Link}
              to={item.path}
              size="sm"
              fw={active ? 600 : 400}
              c={active ? palette.text : palette.textSoft}
              style={{
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                backgroundColor: active ? palette.surface : "transparent",
                transition: "all 0.2s ease",
                borderBottom: active ? `2px solid ${palette.accent}` : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = palette.surface;
                  e.currentTarget.style.color = palette.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = palette.textSoft;
                }
              }}
            >
              {Icon && <Icon size={16} />}
              {item.label}
            </Text>
          );
        })}
      </Group>
    </div>
  );
};

export default TopNav;

