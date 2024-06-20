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
            "relationships":["CONNECTED_TO"],
            "export_format": "d3"
        }
        const fetchData = async () => {
            try {
                const response = await fetch('https://neo4j-python-server-1.onrender.com/relationships', {
                    method: 'POST', // Use the POST method to send data
                    headers: {
                        'Content-Type': 'application/json', // Set the content type header
                    },
                    body: JSON.stringify(requestData), // Convert the JSON data to a string
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const newData = await response.json();
                setData(({ nodes, links }) => {
                    // Merge new nodes and links with existing ones
                    const updatedNodes = [...nodes, ...newData.nodes.filter(newNode => !nodes.some(node => node.id === newNode.id))];
                    const updatedLinks = [...links, ...newData.links.filter(newLink => !links.some(link => link.source === newLink.source && link.target === newLink.target))];
                    return { nodes: updatedNodes, links: updatedLinks };
                });
            } catch (error) {
                console.error('Fetching data failed:', error);
            }
        };

        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
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