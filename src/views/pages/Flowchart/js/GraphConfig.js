import { Graph, Shape, Addon } from "@antv/x6";

const PORTS = {
  groups: {
    top: {
      position: "top",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    right: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    bottom: {
      position: "bottom",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    left: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#5F95FF",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
  },
  items: [
    {
      group: "top",
    },
    {
      group: "right",
    },
    {
      group: "bottom",
    },
    {
      group: "left",
    },
  ],
};

const setupGraph = (graphContainerEl) => {

  // #region 初始化画布
  const graph = new Graph({
    container: graphContainerEl,
    grid: true,
    width: '100%',
    height: '100%',
    panning: {
      enabled: true,
      eventTypes: "rightMouseDown",
    },

    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      anchor: "center",
      connectionPoint: "anchor",
      allowBlank: false,
      highlight: true,
      allowLoop: false,
      allowMulti: false,
      allowEdge: false,
      router: {
        name: "manhattan",
        args: {
          padding: 1,
        },
      },
      connector: {
        name: "rounded",
        args: {
          radius: 8,
        },
      },

      snap: {
        radius: 30,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: "#A2B1C3",
              strokeWidth: 1,
              targetMarker: {
                name: "block",
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        });
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet;
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#5F95FF",
            stroke: "#5F95FF",
            strokeWidth: 4
          },
        },
      },
    },
    resizing: true,
    // rotating: true,
    selecting: {
      // enabled: true,
      // multiple: true,
      // rubberband: true,
      // rubberEdge: true,
      // showNodeSelectionBox: true,

      enabled: true,
      multiple: true,
      rubberEdge: true,
      rubberNode: true,
      // modifiers: 'shift',
      rubberband: true,

    },
    snapline: true,
    keyboard: true,
    clipboard: true,
    history: true
  });

  _registerEdges()
  _registerNodes()
  _registerEvent(graph)
  _setupNodeEvent(graph)
  return graph
}


const _registerEvent = (graph) => {
  // copy/cut and paste
  graph.bindKey(["meta+c", "ctrl+c"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.copy(cells);
    }
    return false;
  });
  graph.bindKey(["meta+x", "ctrl+x"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.cut(cells);
    }
    return false;
  });
  graph.bindKey(["meta+v", "ctrl+v"], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 });
      graph.cleanSelection();
      graph.select(cells);
    }
    return false;
  });

  //undo redo
  graph.bindKey(["meta+z", "ctrl+z"], () => {
    if (graph.history.canUndo()) {
      graph.history.undo();
    }
    return false;
  });
  graph.bindKey(["meta+shift+z", "ctrl+shift+z", "ctrl+y", "meta+y"], () => {
    if (graph.history.canRedo()) {
      graph.history.redo();
    }
    return false;
  });

  // select all
  graph.bindKey(["meta+a", "ctrl+a"], (e) => {
    const nodes = graph.getNodes();
    if (nodes) {
      graph.select(nodes);
    }
  });

  //delete
  graph.bindKey(["backspace", "delete"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(cells);
    }
  });

  // zoom
  graph.bindKey(["ctrl+1", "meta+1"], () => {
    const zoom = graph.zoom();
    if (zoom < 1.5) {
      graph.zoom(0.1);
    }
  });

  graph.bindKey(["ctrl+2", "meta+2"], () => {
    const zoom = graph.zoom();
    if (zoom > 0.5) {
      graph.zoom(-0.1);
    }
  });



  // graph.bindKey(["alt", "ctrl"], () => {
  //   graph.enablePanning()
  // }, "keypress");


  // graph.bindKey(["alt", "ctrl"], () => {
  //   graph.disablePanning()
  // }, "keyup");
}

const _registerNodes = () => {
  
  Graph.registerNode(
    "query-node",
    {
      inherit: "rect",
      width: 81,
      height: 51,
      attrs: {
        body: {
          strokeWidth: 0.5,
          stroke: "#5F95FF",
          fill: "#EFF4FF",
        },
        text: {
          fontSize: 12,
          fill: "#262626",
        },
      },
      ports: { ...PORTS },
    },
    true
  );

  Graph.registerNode(
    "table-node",
    
    {
      inherit: "cylinder",
      // shape: 'cylinder',
      width: 60,
      height: 70,
      attrs: {
        top: {
          fill: '#fe854f',
          fillOpacity: 0.5,
          strokeWidth: 0.5,
        },
        body: {
          strokeWidth: 0.5,
          fill: '#ED8A19',
          fillOpacity: 0.8,
        },
      },
      ports: { ...PORTS },
    },
    true
  );

  Graph.registerNode(
    "output-node",
    {
      inherit: "rect",
      width: 80,
      height: 50,
      attrs: {
        body: {
          stroke: '#237804',
          fill: '#73d13d',
          rx: 50,
          ry: 50,
          strokeWidth: 0.5,
        },
      },
      ports: { ...PORTS },
    },
    true
  );

}

const _registerEdges = () => {
  
  Graph.registerEdge(
    'dag-edge',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#C2C8D5',
          strokeWidth: 1,
          targetMarker: null,
        },
      },
    },
    true,
  )
}

const _setupNodeEvent = (graph) => {
  const showPorts = (ports, show) => {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.visibility = show ? "visible" : "hidden";
    }
  };

  graph.on("node:mouseenter", () => {
    const ports = graph.options.container.querySelectorAll(".x6-port-body");
    showPorts(ports, true);
  });
  graph.on("node:mouseleave", () => {
    const ports = graph.options.container.querySelectorAll(".x6-port-body");
    showPorts(ports, false);
  });

}

export default {
  setupGraph
}