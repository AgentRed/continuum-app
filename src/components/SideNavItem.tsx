import React from "react";
import { NavLink } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { matchesRoute, type SideNavItem as SideNavItemType } from "../navigation/navConfig";

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

interface SideNavItemProps {
  item: SideNavItemType;
  palette: PaletteDef;
}

export default function SideNavItem({ item, palette }: SideNavItemProps) {
  const location = useLocation();
  const isActive = matchesRoute(location.pathname, item.matchers);

  return (
    <div
      style={{
        borderRadius: 8,
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = palette.header;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <NavLink
        label={item.label}
        description={item.description}
        leftSection={<item.icon size={18} color={palette.textSoft} />}
        component={Link}
        to={item.path}
        active={isActive}
        styles={{
          root: {
            borderRadius: 8,
            backgroundColor: isActive ? palette.surface : "transparent",
          },
          label: { color: palette.text },
          description: { color: palette.textSoft },
        }}
      />
    </div>
  );
}





