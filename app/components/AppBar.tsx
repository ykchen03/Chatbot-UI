"use client";
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import QuickreplyIcon from "@mui/icons-material/Quickreply";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteIcon from "@mui/icons-material/Delete";
import { Fab } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

interface ReAppBarProps {
  conversations: any[];
  newChat: () => void;
  currentConversation: string | null;
  setCurrentConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  user: any;
  children: React.ReactNode;
}

export default function ChatAppBar({
  conversations,
  newChat,
  currentConversation,
  setCurrentConversation,
  deleteConversation,
  user,
  children,
}: ReAppBarProps): React.JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
      } else {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
    handleCloseUserMenu();
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#212121" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: "transparent", height: "56px" }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
              },
              open && { display: "none" },
            ]}
          >
            <MenuOpenIcon />
          </IconButton>
          <QuickreplyIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "sans-serif",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              flexGrow: 1,
            }}
          >
            Llama 3.1
          </Typography>
          <Box sx={{ flexGrow: 0}}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user.email} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px',}}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem disabled={true}>
                <Typography sx={{ textAlign: 'center' }}>{user.email}</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleLogout()}>
                <Typography sx={{ textAlign: 'center' }}>Log Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#181818",
            color: "#ffffff",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} color="inherit">
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem
            disablePadding
            className="hover:bg-charcoal mb-8 text-sm"
          >
            <ListItemButton onClick={() => newChat()}>
              <ListItemIcon>
                <EditDocumentIcon
                  className="fill-white!"
                  sx={{ fontSize: 18 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={"New Chat"}
                slotProps={{
                  primary: { fontSize: "inherit", lineHeight: "inherit" },
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem
              disablePadding
              className="gap-2 mb-2 text-sm"
            >
              <ListItemButton disabled={true}>
                <ListItemText
                  primary={"Chats"}
                  slotProps={{
                    primary: { fontSize: "inherit", lineHeight: "inherit", className: "truncate whitespace-nowrap overflow-hidden" },
                  }}
                />
              </ListItemButton>  
            </ListItem>
          {conversations.map((c, index) => (
            <ListItem
              key={index}
              disablePadding
              className={`hover:bg-charcoal gap-2 mb-2 text-sm ${currentConversation === c.id ? "bg-charcoal" : ""}`}
            >
              <ListItemButton onClick={() => setCurrentConversation(c.id)}>
                <ListItemText
                  primary={c.title}
                  slotProps={{
                    primary: { fontSize: "inherit", lineHeight: "inherit", className: "truncate whitespace-nowrap overflow-hidden" },
                  }}
                />
              </ListItemButton>
              <IconButton
                edge="end"
                aria-label="delete"
                size="small"
                className="mr-2! hover:bg-red-600!"
                onClick={() => deleteConversation(c.id)}
              >
                <DeleteIcon className="fill-white!" sx={{ fontSize: 18 }} />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}

export function HomeAppBar() {
  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "transparent", height: "56px" }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2 }}
        >
          <QuickreplyIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            flexGrow: 1,
            fontFamily: "sans-serif",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Llama 3.1
        </Typography>
        <Fab
          href="/auth/signin"
          variant="extended"
          size="medium"
          sx={{
            backgroundColor: "#1F1F1F",
            color: "white",
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: "#333333", // your desired hover color
            },
          }}
        >
          <Typography className="normal-case" fontSize="inherit">
            Log in
          </Typography>
        </Fab>
      </Toolbar>
    </AppBar>
  );
}

export function AuthAppBar() {
  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "transparent", height: "56px", color: "black" }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2 }}
        >
          <QuickreplyIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            flexGrow: 1,
            fontFamily: "sans-serif",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Llama 3.1
        </Typography>
      </Toolbar>
    </AppBar>
  );
}