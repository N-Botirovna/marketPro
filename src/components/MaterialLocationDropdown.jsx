"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Fade,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import {
  ExpandMore,
  LocationOn,
  ChevronRight,
} from "@mui/icons-material";
import { getRegions } from "@/services/regions";

const MaterialLocationDropdown = () => {
  const [regions, setRegions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [loading, setLoading] = useState(true);

  const open = Boolean(anchorEl);

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHoveredRegionId(null);
  };

  const handleRegionHover = (regionId) => {
    setHoveredRegionId(regionId);
  };

  const handleRegionLeave = () => {
    setHoveredRegionId(null);
  };

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await getRegions({ limit: 50 });
        setRegions(res.regions || []);
      } catch (error) {
        console.error("Viloyat ma'lumotlarini olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return (
    <>
      <Button
        variant="outlined"
        onMouseEnter={handleMouseEnter}
        endIcon={<ExpandMore />}
        startIcon={<LocationOn />}
        sx={{
          minWidth: 150,
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
        disabled={loading}
      >
        {loading ? "Yuklanmoqda..." : "Joylashuv"}
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
            minWidth: 500,
            maxHeight: 400,
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
        <Box sx={{ display: "flex", height: 400, overflow: "hidden" }}>
          {/* Left Panel - Regions */}
          <Box
            sx={{
              width: 250,
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
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                Viloyatlar
              </Typography>
            </Box>
            <Stack spacing={0.5} sx={{ p: 1 }}>
              {regions.map((region) => (
                <Box
                  key={region.id}
                  onMouseEnter={() => handleRegionHover(region.id)}
                  onMouseLeave={handleRegionLeave}
                  sx={{
                    position: "relative",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.02)",
                      transform: "translateX(2px)",
                    },
                    backgroundColor:
                      hoveredRegionId === region.id ? "rgba(25,118,210,0.05)" : "transparent",
                    borderLeft:
                      hoveredRegionId === region.id
                        ? "3px solid #1976d2"
                        : "3px solid transparent",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    borderRadius: 1,
                  }}
                >
                  <Button
                    fullWidth
                    startIcon={<LocationOn sx={{ fontSize: 18 }} />}
                    endIcon={
                      region.districts && region.districts.length > 0 ? (
                        <ChevronRight sx={{ fontSize: 16 }} />
                      ) : null
                    }
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      py: 1.5,
                      px: 2,
                      color: "#333",
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {region.name}
                    </Typography>
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Right Panel - Districts */}
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
            {hoveredRegionId && (
              <Box>
                {(() => {
                  const region = regions.find(
                    (reg) => reg.id === hoveredRegionId
                  );
                  if (!region || !region.districts?.length) {
                    return (
                      <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          Ushbu viloyatda tumanlar yo'q
                        </Typography>
                      </Box>
                    );
                  }

                  return (
                    <>
                      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {region.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {region.districts.length} ta tuman
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1, maxHeight: 300, overflowY: "auto", overflowX: "hidden",
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
                          {region.districts.map((district) => (
                            <Link
                              key={district.id}
                              href={`/vendor-two?region=${region.id}&district=${district.id}`}
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
                                  {district.name}
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

            {!hoveredRegionId && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Viloyatni tanlang
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default MaterialLocationDropdown;
