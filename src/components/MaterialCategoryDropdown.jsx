"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Box,
  Button,
  Menu,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandMore,
  Book,
  ChevronRight,
} from "@mui/icons-material";
import { getBookCategories } from "@/services/categories";
import { useTranslations } from "next-intl";

const MaterialCategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const tCat = useTranslations("Categories")
  const open = Boolean(anchorEl);

  const handleMouseEnterButton = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuMouseEnter = () => setIsMenuHovered(true);
  const handleMenuMouseLeave = () => {
    setIsMenuHovered(false);
    setAnchorEl(null);
    setHoveredCategory(null);
  };

  const handleCategoryHover = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getBookCategories({ limit: 20 });
        setCategories(res.categories || []);
      } catch (error) {
        console.error("Kategoriya ma'lumotlarini olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Button
        variant="outlined"
        startIcon={<MenuIcon />}
        sx={{
          minWidth: 200,
          height: 48,
          borderRadius: 1,
          textTransform: "none",
          fontWeight: 500,
          borderColor: "#e0e0e0",
          color: "#333",
        }}
        disabled
      >
        Yuklanmoqda...
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<MenuIcon />}
        onMouseEnter={handleMouseEnterButton}
        endIcon={<ExpandMore />}
        sx={{
          minWidth: 200,
          height: 48,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 500,
          borderColor: "transparent",
          backgroundColor: "#fefefe",
          color: "#333",
          "&:hover": {
            backgroundColor: "#f8f8f8",
            transform: "translateY(-1px) scale(1.01)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          },
        }}
      >
        {tCat("allCat")}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuMouseLeave}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 600,
            maxHeight: 500,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            border: "none",
            overflow: "hidden",
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(255,255,255,0.95)",
          },
        }}
        MenuListProps={{
          sx: { p: 0 },
          onMouseEnter: handleMenuMouseEnter,
          onMouseLeave: handleMenuMouseLeave,
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <Box sx={{ display: "flex", height: 500 }}>
          {/* Left categories */}
          <Box
            sx={{
              width: 300,
              borderRight: "1px solid rgba(0,0,0,0.05)",
              overflowY: "auto",
              backgroundColor: "rgba(254,254,254,0.9)",
            }}
          >
            <List sx={{ p: 0 }}>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  disablePadding
                  onMouseEnter={() => handleCategoryHover(category.id)}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                    backgroundColor:
                      hoveredCategory === category.id
                        ? "rgba(25,118,210,0.05)"
                        : "transparent",
                    borderLeft:
                      hoveredCategory === category.id
                        ? "3px solid #1976d2"
                        : "3px solid transparent",
                    transition: "all 0.3s",
                  }}
                >
                  <Link
                    href={`/vendor-two?category=${encodeURIComponent(
                      category.name
                    )}`}
                    style={{ width: "100%", textDecoration: "none" }}
                  >
                    <ListItemButton sx={{ py: 1.5, px: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {category.picture ? (
                          <Box
                            component="img"
                            src={category.picture}
                            alt={category.name}
                            sx={{ width: 24, height: 24, objectFit: "contain" }}
                          />
                        ) : (
                          <Book sx={{ color: "#666", fontSize: 20 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={category.name}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#333",
                        }}
                      />
                      {category.subcategories?.length > 0 && (
                        <ChevronRight sx={{ color: "#666", fontSize: 16 }} />
                      )}
                    </ListItemButton>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right subcategories */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#fff",
            }}
          >
            {hoveredCategory ? (
              (() => {
                const category = categories.find(
                  (cat) => cat.id === hoveredCategory
                );
                if (!category?.subcategories?.length) {
                  return (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Ushbu kategoriyada kichik kategoriyalar yo‘q
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <>
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.subcategories.length} ta kichik kategoriya
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1 }}>
                      <Stack spacing={0.5}>
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/vendor-two?subcategory=${subcategory.id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Button
                              fullWidth
                              sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                py: 1.5,
                                px: 2,
                                color: "#333",
                                borderRadius: 2,
                                "&:hover": {
                                  backgroundColor: "rgba(25,118,210,0.06)",
                                  color: "#1976d2",
                                  transform: "translateX(4px)",
                                  boxShadow: "0 2px 8px rgba(25,118,210,0.1)",
                                },
                              }}
                              onClick={handleMenuMouseLeave}
                            >
                              <Typography variant="body2">
                                {subcategory.name}
                              </Typography>
                            </Button>
                          </Link>
                        ))}
                      </Stack>
                    </Box>
                  </>
                );
              })()
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Kategoriyani tanlang
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default MaterialCategoryDropdown;
