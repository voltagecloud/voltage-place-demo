{ pkgs }: {
  deps = [
    pkgs.python38Full
    pkgs.sudo
    # pkgs.pip
  ];
  env = {
    # vvv THIS MAKES PRISMA SAD vvv
    PYTHON_LD_LIBRARY_PATH_LSP = pkgs.lib.makeLibraryPath [
      # Needed for pandas / numpy
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
      # Needed for pygame
      pkgs.glib
      # Needed for matplotlib
      pkgs.xorg.libX11
    ];
    PYTHONBIN = "${pkgs.python38Full}/bin/python3.8";
    LANG = "en_US.UTF-8";
  };
}