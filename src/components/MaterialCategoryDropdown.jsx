"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Paper,
  Fade,
  IconButton,
  Chip,
  Stack,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandMore,
  ExpandLess,
  Book,
  ChevronRight,
  Close,
} from "@mui/icons-material";
import { getBookCategories } from "@/services/categories";

const MaterialCategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const open = Boolean(anchorEl);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredCategory(null);
  };

  const handleCategoryHover = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
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
          "&:hover": {
            borderColor: "#1976d2",
            backgroundColor: "#f5f5f5",
          },
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
        onMouseEnter={handleMouseEnter}
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
          transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            backgroundColor: "#f8f8f8",
            transform: "translateY(-1px) scale(1.01)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          },
        }}
      >
        Barcha Kategoriyalar
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMouseLeave}
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
            animation: "slideInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          },
        }}
        MenuListProps={{
          sx: { p: 0 },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        onMouseLeave={handleMouseLeave}
      >
        <Box sx={{ display: "flex", height: 500, overflow: "hidden" }}>
          {/* Left Panel - Categories */}
          <Box
            sx={{
              width: 300,
              borderRight: "1px solid rgba(0,0,0,0.05)",
              overflowY: "auto",
              overflowX: "hidden",
              backgroundColor: "rgba(254,254,254,0.9)",
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.15)",
              },
            }}
          >
            {/* <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                Kategoriyalar
              </Typography>
            </Box> */}
            <List sx={{ p: 0 }}>
              {categories.map((category, index) => (
                <ListItem
                  key={category.id}
                  disablePadding
                  onMouseEnter={() => handleCategoryHover(category.id)}
                  onMouseLeave={handleCategoryLeave}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.02)",
                      transform: "translateX(2px)",
                    },
                    backgroundColor:
                      hoveredCategory === category.id ? "rgba(25,118,210,0.05)" : "transparent",
                    borderLeft:
                      hoveredCategory === category.id
                        ? "3px solid #1976d2"
                        : "3px solid transparent",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                >
                  <ListItemButton
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {category.picture ? (
                        <Box
                          component="img"
                          src={category.picture}
                          alt={category.name}
                          sx={{
                            width: 24,
                            height: 24,
                            objectFit: "contain",
                            borderRadius: 0.5,
                          }}
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
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right Panel - Subcategories */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              backgroundColor: "#fff",
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.15)",
              },
            }}
          >
            {hoveredCategory && (
              <Box>
                {(() => {
                  const category = categories.find(
                    (cat) => cat.id === hoveredCategory
                  );
                  if (!category || !category.subcategories?.length) {
                    return (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Ushbu kategoriyada kichik kategoriyalar yo'q
                        </Typography>
                      </Box>
                    );
                  }

                  return (
                    <>
                      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.subcategories.length} ta kichik kategoriya
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1, maxHeight: 400, overflowY: "auto", overflowX: "hidden",
                        "&::-webkit-scrollbar": {
                          width: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "rgba(0,0,0,0.1)",
                          borderRadius: "2px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "rgba(0,0,0,0.15)",
                        },
                      }}>
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
                                  transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                  "&:hover": {
                                    backgroundColor: "rgba(25,118,210,0.06)",
                                    color: "#1976d2",
                                    transform: "translateX(4px) scale(1.01)",
                                    boxShadow: "0 2px 8px rgba(25,118,210,0.1)",
                                  },
                                }}
                                onClick={handleMouseLeave}
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
                })()}
              </Box>
            )}

            {!hoveredCategory && (
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
