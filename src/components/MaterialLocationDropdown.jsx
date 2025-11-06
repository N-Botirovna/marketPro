"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Box, Button, Menu, Typography, Fade, Stack } from "@mui/material";
import { ExpandMore, LocationOn, ChevronRight } from "@mui/icons-material";
import { getRegions } from "@/services/regions";

const MaterialLocationDropdown = () => {
  const [regions, setRegions] = useState([]);
  const tLoc = useTranslations('Location');
  const tLoad = useTranslations('Loading');
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const open = Boolean(anchorEl);

  const handleMouseEnterButton = (event) => setAnchorEl(event.currentTarget);
  const handleMenuMouseEnter = () => setIsMenuHovered(true);
  const handleMenuMouseLeave = () => {
    setIsMenuHovered(false);
    setAnchorEl(null);
    setHoveredRegionId(null);
  };

  const handleRegionHover = (regionId) => setHoveredRegionId(regionId);

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
        onMouseEnter={handleMouseEnterButton}
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
          "&:hover": {
            backgroundColor: "#f8f8f8",
            transform: "translateY(-1px) scale(1.01)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          },
        }}
        disabled={loading}
      >
        {loading ? tLoad('loading') : tLoc('regions')}
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
            minWidth: 500,
            maxHeight: 400,
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
        <Box sx={{ display: "flex", height: 400, overflow: "hidden" }}>
          {/* Left Panel - Regions */}
          <Box
            sx={{
              width: 250,
              borderRight: "1px solid rgba(0,0,0,0.05)",
              overflowY: "auto",
              backgroundColor: "rgba(254,254,254,0.9)",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                {tLoc('regions')}
              </Typography>
            </Box>
            <Stack spacing={0.5} sx={{ p: 1 }}>
              {regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/vendor-two?region=${region.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    onMouseEnter={() => handleRegionHover(region.id)}
                    sx={{
                      position: "relative",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      backgroundColor:
                        hoveredRegionId === region.id
                          ? "rgba(25,118,210,0.05)"
                          : "transparent",
                      borderLeft:
                        hoveredRegionId === region.id
                          ? "3px solid #1976d2"
                          : "3px solid transparent",
                      transition: "all 0.3s",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.02)",
                        transform: "translateX(2px)",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#333" }}
                    >
                      {region.name}
                    </Typography>
                    {region.districts?.length > 0 && (
                      <ChevronRight sx={{ fontSize: 16, color: "#666" }} />
                    )}
                  </Box>
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Right Panel - Districts */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              backgroundColor: "#fff",
            }}
          >
            {hoveredRegionId ? (
              (() => {
                const region = regions.find((r) => r.id === hoveredRegionId);
                if (!region || !region.districts?.length) {
                  return (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        {tLoc('noDistricts')}
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
                        {region.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {region.districts.length} {tLoc('districtCount')}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1 }}>
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
                                {district.name}
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
                  {tLoc('selectRegion')}
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
