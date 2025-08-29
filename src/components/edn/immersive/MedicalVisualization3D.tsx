import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Settings,
  Eye,
  EyeOff,
  Layers,
  Zap,
  Palette,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MedicalConcept3D {
  id: string;
  name: string;
  type: 'organ' | 'system' | 'process' | 'structure';
  color: string;
  position: [number, number, number];
  scale: [number, number, number];
  description: string;
  interactions?: string[];
  visible: boolean;
}

interface MedicalVisualization3DProps {
  itemCode: string;
  concepts: string[];
  onConceptSelect?: (concept: string) => void;
}

export const MedicalVisualization3D: React.FC<MedicalVisualization3DProps> = ({
  itemCode,
  concepts,
  onConceptSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const frameRef = useRef<number>();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'xray' | 'layers'>('3d');

  // Concepts 3D basés sur l'item médical
  const [medicalConcepts, setMedicalConcepts] = useState<MedicalConcept3D[]>([]);

  // Initialisation des concepts selon l'item
  useEffect(() => {
    const generateConcepts = (itemCode: string): MedicalConcept3D[] => {
      const baseConfig = {
        'IC-1': [
          {
            id: 'communication',
            name: 'Communication',
            type: 'process' as const,
            color: '#3b82f6',
            position: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            description: 'Process de communication médecin-patient',
            interactions: ['empathie', 'ecoute'],
            visible: true
          },
          {
            id: 'empathie',
            name: 'Empathie',
            type: 'process' as const,
            color: '#f59e0b',
            position: [-2, 1, 0] as [number, number, number],
            scale: [0.8, 0.8, 0.8] as [number, number, number],
            description: 'Capacité d\'empathie du médecin',
            visible: true
          },
          {
            id: 'ecoute',
            name: 'Écoute Active',
            type: 'process' as const,
            color: '#10b981',
            position: [2, 1, 0] as [number, number, number],
            scale: [0.8, 0.8, 0.8] as [number, number, number],
            description: 'Techniques d\'écoute active',
            visible: true
          }
        ],
        'IC-91': [
          {
            id: 'cerveau',
            name: 'Cerveau',
            type: 'organ' as const,
            color: '#ef4444',
            position: [0, 1, 0] as [number, number, number],
            scale: [1.2, 1.2, 1.2] as [number, number, number],
            description: 'Structure cérébrale affectée',
            visible: true
          },
          {
            id: 'neurones',
            name: 'Réseau Neuronal',
            type: 'system' as const,
            color: '#8b5cf6',
            position: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            description: 'Réseau de neurones impliqué',
            visible: true
          }
        ]
      };

      return baseConfig[itemCode as keyof typeof baseConfig] || [
        {
          id: 'concept-general',
          name: 'Concept Médical',
          type: 'structure',
          color: '#6366f1',
          position: [0, 0, 0],
          scale: [1, 1, 1],
          description: 'Représentation 3D du concept médical',
          visible: true
        }
      ];
    };

    setMedicalConcepts(generateConcepts(itemCode));
  }, [itemCode]);

  // Initialisation Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // Chargement dynamique de Three.js
    const initThreeJS = async () => {
      // Simulation du script Three.js - en réalité, il faudrait charger via CDN ou npm
      const THREE = (window as any).THREE;
      
      if (!THREE) {
        // Charger Three.js dynamiquement
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => initScene();
        document.head.appendChild(script);
      } else {
        initScene();
      }
    };

    const initScene = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !mountRef.current) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Lumières
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(2, 2, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Créer les objets 3D pour chaque concept
      medicalConcepts.forEach(concept => {
        createConceptObject(concept, scene, THREE);
      });

      // Contrôles de souris
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      const onMouseDown = (event: MouseEvent) => {
        isDragging = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      };

      const onMouseMove = (event: MouseEvent) => {
        if (isDragging) {
          const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
          };

          // Rotation de la caméra
          const spherical = new THREE.Spherical();
          spherical.setFromVector3(camera.position);
          spherical.theta -= deltaMove.x * 0.01;
          spherical.phi += deltaMove.y * 0.01;
          spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

          camera.position.setFromSpherical(spherical);
          camera.lookAt(0, 0, 0);

          previousMousePosition = {
            x: event.clientX,
            y: event.clientY
          };
        }
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onWheel = (event: WheelEvent) => {
        const delta = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(delta);
        camera.position.clampLength(2, 10);
      };

      // Raycasting pour la sélection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseClick = (event: MouseEvent) => {
        if (isDragging) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          const selectedObject = intersects[0].object;
          const conceptId = selectedObject.userData.conceptId;
          if (conceptId) {
            setSelectedConcept(conceptId);
            onConceptSelect?.(conceptId);
          }
        }
      };

      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('wheel', onWheel);
      renderer.domElement.addEventListener('click', onMouseClick);

      // Boucle d'animation
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);

        // Rotation automatique
        if (!isDragging) {
          scene.children.forEach((child: any) => {
            if (child.userData.conceptId) {
              child.rotation.y += 0.005 * animationSpeed;
            }
          });
        }

        renderer.render(scene, camera);
      };

      animate();

      // Gestion du redimensionnement
      const handleResize = () => {
        if (!mountRef.current) return;
        
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.domElement.removeEventListener('click', onMouseClick);
      };
    };

    initThreeJS();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [medicalConcepts, animationSpeed]);

  // Création d'objets 3D pour les concepts
  const createConceptObject = (concept: MedicalConcept3D, scene: any, THREE: any) => {
    let geometry;
    
    switch (concept.type) {
      case 'organ':
        geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      case 'system':
        geometry = new THREE.CylinderGeometry(0.5, 1, 2, 8);
        break;
      case 'process':
        geometry = new THREE.ConeGeometry(1, 2, 6);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshPhongMaterial({ 
      color: concept.color,
      transparent: true,
      opacity: concept.visible ? 0.8 : 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...concept.position);
    mesh.scale.set(...concept.scale);
    mesh.userData = { 
      conceptId: concept.id,
      concept: concept
    };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    // Ajouter du texte si les labels sont activés
    if (showLabels) {
      // Labels 3D - nécessiterait une police chargée
      const textGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(
        concept.position[0],
        concept.position[1] + 1.5,
        concept.position[2]
      );
      scene.add(textMesh);
    }
  };

  // Toggle concept visibility
  const toggleConceptVisibility = (conceptId: string) => {
    setMedicalConcepts(prev => 
      prev.map(concept => 
        concept.id === conceptId 
          ? { ...concept, visible: !concept.visible }
          : concept
      )
    );
  };

  // Reset camera
  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const selectedConceptData = medicalConcepts.find(c => c.id === selectedConcept);

  return (
    <div className="space-y-4">
      <Card className={`relative overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
        <CardHeader className={`${!showControls && !isFullscreen ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Visualisation 3D - {itemCode}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowControls(!showControls)}
              >
                {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Viewport 3D */}
          <div 
            ref={mountRef} 
            className={`bg-gradient-to-br from-blue-50 to-purple-50 ${
              isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-96'
            }`}
            style={{ minHeight: '300px' }}
          />

          {/* Contrôles flottants */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <div className="flex gap-4">
                  {/* Panel de contrôle */}
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-4">
                        <Button size="sm" onClick={resetCamera}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <Slider
                            value={[animationSpeed]}
                            onValueChange={([value]) => setAnimationSpeed(value)}
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-20"
                          />
                        </div>

                        <div className="flex gap-1">
                          {['3d', 'xray', 'layers'].map(mode => (
                            <Button
                              key={mode}
                              size="sm"
                              variant={viewMode === mode ? 'default' : 'outline'}
                              onChange={() => setViewMode(mode as any)}
                              className="text-xs"
                            >
                              {mode}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liste des concepts */}
                  <Card className="bg-white/90 backdrop-blur-sm flex-1">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {medicalConcepts.map(concept => (
                          <Button
                            key={concept.id}
                            size="sm"
                            variant={selectedConcept === concept.id ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedConcept(concept.id);
                              toggleConceptVisibility(concept.id);
                            }}
                            className="text-xs"
                            style={{
                              backgroundColor: concept.visible ? concept.color + '20' : undefined,
                              borderColor: concept.color
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full mr-1"
                              style={{ backgroundColor: concept.color }}
                            />
                            {concept.name}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info concept sélectionné */}
          <AnimatePresence>
            {selectedConceptData && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="absolute top-4 right-4 w-80"
              >
                <Card className="bg-white/95 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedConceptData.color }}
                      />
                      {selectedConceptData.name}
                    </CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {selectedConceptData.type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedConceptData.description}
                    </p>
                    
                    {selectedConceptData.interactions && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Interactions:</h4>
                        <div className="flex gap-1 flex-wrap">
                          {selectedConceptData.interactions.map(interaction => (
                            <Badge key={interaction} variant="outline" className="text-xs">
                              {interaction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Instructions 3D</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Cliquez et glissez pour faire tourner la vue</li>
                <li>• Molette de la souris pour zoomer/dézoomer</li>
                <li>• Cliquez sur un objet pour le sélectionner</li>
                <li>• Utilisez les boutons de concept pour masquer/afficher</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};