"use client";

import SpriteText from 'three-spritetext';
import ForceGraph3D from 'react-force-graph-3d';
import {useState, useEffect} from 'react';

export default function Home() {
  const [data, setData] = useState({ nodes: [], links: [] });

  const colors = [
    "#8BD3E6",
    "#FF6D6A",
    "#E9EC6B",
    "#EFBE7D",
    "#B1A2CA"
  ]
  
  useEffect(() => {
    const requestData = {
      "nodes": ["User"],
      "relationships": ["CONNECTED_TO"],
      "export_format": "d3"
    }

    const fetchData = async () => {
      try {
        const response = await fetch('https://neo4j-python-server-1.onrender.com/relationships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const newData = await response.json();

        // Add nodes and links one by one with a delay
        for (const newNode of newData.nodes) {
          if (!data.nodes.some(node => node.id === newNode.id)) {
            setData(prevData => ({ ...prevData, nodes: [...prevData.nodes, newNode] }));
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay of 500ms
          }
        }

        for (const newLink of newData.links) {
          if (!data.links.some(link => link.source === newLink.source && link.target === newLink.target)) {
            setData(prevData => ({ ...prevData, links: [...prevData.links, newLink] }));
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay of 500ms
          }
        }
      } catch (error) {
        console.error('Fetching data failed:', error);
      }
    };

    fetchData();
  }, []);

    return (

      <ForceGraph3D
        // nodeColor={"#ab21fe"}
        enableNodeDrag={false}
        graphData={data}
        nodeLabel={node => node.properties.firstName} // Assuming nodes have a 'label' property
        nodeAutoColorBy="group" // Optionally color nodes by a group property
        linkColor={"#ab21fe"}
        linkWidth={1}
        linkOpacity={0.5}
        nodeThreeObject={node => {
            const sprite = new SpriteText(node.properties.firstName);
            sprite.color = "black";
            sprite.padding = 4;
            // Map the color deterministically to a color in the colors array
            sprite.backgroundColor = colors[Number(node.properties.firstName.split('').map(char => char.charCodeAt(0)).join('')) % colors.length];
            sprite.borderRadius = 10;
            sprite.textHeight = 8;
            return sprite;
          }}
    />
    );
};